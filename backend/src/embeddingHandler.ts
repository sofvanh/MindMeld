import axios from 'axios';
import { cosineSimilarity } from './utils/math';
import config from './config';


/**
 * Generates edges between the most semantically similar nodes using mutual rank scoring.
 *
 * For each pair of nodes, calculates their cosine similarity and relative ranking in each other's
 * similarity lists. The mutual rank score is the inverse of the sum of these rankings (higher is better).
 *
 * For example, if node A ranks node B as its 2nd most similar, and B ranks A as its 3rd most
 * similar, their mutual rank score would be 1 / (2 + 3) = 0.2.
 *
 * This score is then adjusted by the clarity score of each node, if provided.
 *
 * @param nodes - Array of nodes with embeddings to analyze
 * @param k - Number of edges per node to generate (default 2)
 * @returns Array of edges connecting the most similar node pairs
 */
export function generateTopKSimilarEdges(nodes: { id: string, embedding: number[], clarity?: number }[], k = 2): { sourceId: string, targetId: string }[] {
  const nodeCount = nodes.length;
  const potentialEdges: { sourceId: string, targetId: string, edgePriority: number }[] = [];

  // Calculate similarity rankings for each node pair, in both directions
  const similarityRankings = nodes.map((sourceNode, sourceIndex) => {
    return nodes.map((targetNode, targetIndex) => {
      if (sourceIndex === targetIndex) return { targetIndex, similarity: -1 }; // Exclude connections to self
      return {
        targetIndex,
        similarity: cosineSimilarity(sourceNode.embedding, targetNode.embedding)
      };
    }).sort((a, b) => b.similarity - a.similarity);
  });

  // Calculate mutual rank score (= priority, how strong is their connection) for each potential edge
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) { // Only process each pair once
      const rankAtoB = similarityRankings[i].findIndex(r => r.targetIndex === j) + 1;
      const rankBtoA = similarityRankings[j].findIndex(r => r.targetIndex === i) + 1;
      const mutualRankScore = 1 / (rankAtoB + rankBtoA);

      // Adjust priority based on clarity scores
      const edgePriority = mutualRankScore * (nodes[i].clarity ?? 1) * (nodes[j].clarity ?? 1);

      // Order links lexicographically for deterministic results that are easier to filter
      const id1 = nodes[i].id;
      const id2 = nodes[j].id;
      potentialEdges.push({
        sourceId: id1 < id2 ? id1 : id2,
        targetId: id1 < id2 ? id2 : id1,
        edgePriority
      });
    }
  }

  // Sort connections by mutual rank score (higher is better)
  potentialEdges.sort((a, b) => b.edgePriority - a.edgePriority);

  // Normalize nodeCount to account for clarity scores
  const normalizedNodeCount = nodes.reduce((sum, node) => sum + (node.clarity ?? 1), 0);

  // Select top n*k connections
  const topConnections = potentialEdges.slice(0, normalizedNodeCount * k);

  return topConnections.map(link => ({
    sourceId: link.sourceId,
    targetId: link.targetId
  }));
}

export async function embedText(texts: string[]): Promise<number[][]> {
  const openAI_api_key = config.openAIKey;
  if (!openAI_api_key) {
    throw new Error('OpenAI API key not found');
  }

  try {
    console.log('Embedding texts...');
    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        input: texts,
        model: 'text-embedding-3-small'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAI_api_key}`
        }
      }
    );

    return response.data.data.map((item: any) => item.embedding);
  } catch (error: any) {
    throw new Error(`Failed to get embeddings: ${error.message}`);
  }
}
