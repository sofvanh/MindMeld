import axios from 'axios';
import { Edge, Graph } from './.shared/types';
import { generateEdgeId } from './db/idGenerator';
import config from './config';

export function generateTopKSimilarEdges(graph: Graph, k = 2): Edge[] {
  const nodeCount = graph.arguments.length;
  const allPossibleLinks: { source: string, target: string, priority: number }[] = [];

  // Generate rankings for each node
  const rankings = graph.arguments.map((sourceNode, i) => {
    return graph.arguments.map((targetNode, j) => {
      if (i === j) return { index: j, similarity: -1 }; // Exclude self
      return {
        index: j,
        similarity: cosineSimilarity(sourceNode.embedding, targetNode.embedding)
      };
    }).sort((a, b) => b.similarity - a.similarity);
  });

  // Calculate priority for each possible connection
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) { // Ensure no duplicate connections
      const rankAtoB = rankings[i].findIndex(r => r.index === j) + 1;
      const rankBtoA = rankings[j].findIndex(r => r.index === i) + 1;
      const priority = rankAtoB * rankBtoA;
      allPossibleLinks.push({ source: graph.arguments[i].id, target: graph.arguments[j].id, priority });
    }
  }

  // Order connections by priority
  allPossibleLinks.sort((a, b) => a.priority - b.priority);

  // Select top n*k connections
  const topConnections = allPossibleLinks.slice(0, nodeCount * k);
  // TODO Optimize this
  // We shouldn't generate IDs here as we will not add all of these
  // This function should only return a deterministic list of source-target pairs where the source is always smaller than the target
  // This way the actual adding of edges can be optimized
  return topConnections.map(link => ({
    id: generateEdgeId(),
    graphId: graph.id,
    sourceId: link.source,
    targetId: link.target
  }));
}

function cosineSimilarity(embedding1: number[], embedding2: number[]) {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have the same length');
  }

  const dotProduct = embedding1.reduce((acc, cur, i) => acc + cur * embedding2[i], 0);
  const magnitude1 = Math.sqrt(embedding1.reduce((acc, cur) => acc + cur * cur, 0));
  const magnitude2 = Math.sqrt(embedding2.reduce((acc, cur) => acc + cur * cur, 0));

  return dotProduct / (magnitude1 * magnitude2);
}

export async function embedText(texts: string[]) {
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