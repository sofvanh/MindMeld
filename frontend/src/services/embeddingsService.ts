import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: This is for development only
});

export interface EmbeddingResult {
  text: string;
  embedding: number[];
  id: string;
}

export interface ThemeLabel {
  title: string;
  summary: string;
}

// Generate embeddings for a list of texts
export async function generateEmbeddings(texts: string[], ids: string[]): Promise<EmbeddingResult[]> {
  if (!process.env.REACT_APP_OPENAI_API_KEY) {
    console.warn('OpenAI API key not found. Please add REACT_APP_OPENAI_API_KEY to your .env file');
    return texts.map((text, index) => ({
      text,
      embedding: new Array(1536).fill(0), // Mock embedding vector
      id: ids[index]
    }));
  }

  try {
    console.log('Generating embeddings for', texts.length, 'texts');

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts
    });

    return response.data.map((item, index) => ({
      text: texts[index],
      embedding: item.embedding,
      id: ids[index]
    }));
  } catch (error) {
    console.error('Error generating embeddings:', error);
    // Return mock embeddings as fallback
    return texts.map((text, index) => ({
      text,
      embedding: new Array(1536).fill(Math.random()), // Random mock embedding
      id: ids[index]
    }));
  }
}

// Calculate cosine similarity between two embedding vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Find most similar statements to a given statement
export function findSimilarStatements(
  targetEmbedding: number[],
  allEmbeddings: EmbeddingResult[],
  topK: number = 5
): Array<EmbeddingResult & { similarity: number }> {
  const similarities = allEmbeddings.map(item => ({
    ...item,
    similarity: cosineSimilarity(targetEmbedding, item.embedding)
  }));

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

// Cluster statements based on embedding similarity
export function clusterStatements(
  embeddings: EmbeddingResult[],
  threshold: number = 0.7
): Array<EmbeddingResult[]> {
  const clusters: Array<EmbeddingResult[]> = [];
  const used = new Set<string>();

  for (const embedding of embeddings) {
    if (used.has(embedding.id)) continue;

    const cluster = [embedding];
    used.add(embedding.id);

    // Find similar statements for this cluster
    for (const other of embeddings) {
      if (used.has(other.id)) continue;

      const similarity = cosineSimilarity(embedding.embedding, other.embedding);
      if (similarity >= threshold) {
        cluster.push(other);
        used.add(other.id);
      }
    }

    clusters.push(cluster);
  }

  return clusters.sort((a, b) => b.length - a.length); // Sort by cluster size
}

// Generate edges based on embedding similarity for graph visualization
export function generateSimilarityEdges(
  embeddings: EmbeddingResult[],
  threshold: number = 0.5,
  maxEdgesPerNode: number = 3
): Array<{ sourceId: string; targetId: string; similarity: number }> {
  const edges: Array<{ sourceId: string; targetId: string; similarity: number }> = [];

  for (let i = 0; i < embeddings.length; i++) {
    const similarities: Array<{ id: string; similarity: number }> = [];

    for (let j = 0; j < embeddings.length; j++) {
      if (i !== j) {
        const similarity = cosineSimilarity(embeddings[i].embedding, embeddings[j].embedding);
        if (similarity >= threshold) {
          similarities.push({ id: embeddings[j].id, similarity });
        }
      }
    }

    // Sort by similarity and take top N connections
    similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxEdgesPerNode)
      .forEach(({ id, similarity }) => {
        // Avoid duplicate edges (A->B and B->A)
        const edgeExists = edges.some(edge =>
          (edge.sourceId === embeddings[i].id && edge.targetId === id) ||
          (edge.sourceId === id && edge.targetId === embeddings[i].id)
        );

        if (!edgeExists) {
          edges.push({
            sourceId: embeddings[i].id,
            targetId: id,
            similarity
          });
        }
      });
  }

  return edges;
}

// Generate descriptive labels and summaries for themes using GPT-4o-mini
export async function generateThemeLabels(clusters: EmbeddingResult[][]): Promise<ThemeLabel[]> {
  console.log('🎯 Starting theme generation for', clusters.length, 'clusters');
  console.log('🔑 API Key present:', !!process.env.REACT_APP_OPENAI_API_KEY);

  if (!process.env.REACT_APP_OPENAI_API_KEY) {
    console.warn('OpenAI API key not found. Using fallback theme labels');
    return clusters.map((_, index) => ({
      title: `Theme ${index + 1}`,
      summary: 'AI-generated theme description unavailable without API key'
    }));
  }

  try {
    const labels: ThemeLabel[] = [];
    console.log('📝 Processing clusters:', clusters.map(c => c.length));

    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i];
      const statements = cluster.map(item => item.text).join('\n\n');

      console.log(`🔄 Processing cluster ${i + 1}/${clusters.length} with ${cluster.length} statements`);

      const prompt = `Analyze this cluster of related statements from an academic discussion about "The AI Scientist" paper and provide:
1. A concise theme title (3-6 words)
2. A brief summary (1-2 sentences) explaining what this cluster is about

Statements:
${statements}

Please respond in JSON format:
{
  "title": "Theme Title Here",
  "summary": "Brief explanation of what this cluster discusses."
}`;

      console.log(`📤 Making API call for cluster ${i + 1}`);
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 150
      });
      console.log(`✅ API response received for cluster ${i + 1}`);

      const content = response.choices[0].message.content;
      console.log(`📋 Raw response for cluster ${i + 1}:`, content);

      if (content) {
        try {
          // Clean the response - remove markdown code blocks if present
          let cleanContent = content.trim();
          if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }

          console.log(`🧹 Cleaned content for cluster ${i + 1}:`, cleanContent);

          const parsed = JSON.parse(cleanContent);
          console.log(`🎉 Successfully parsed JSON for cluster ${i + 1}:`, parsed);
          labels.push({
            title: parsed.title || `Theme ${i + 1}`,
            summary: parsed.summary || 'Theme analysis unavailable'
          });
        } catch (parseError) {
          console.warn(`❌ Failed to parse theme label JSON for cluster ${i + 1}:`, parseError);
          console.warn('Raw content that failed to parse:', content);
          labels.push({
            title: `Theme ${i + 1}`,
            summary: 'Theme analysis unavailable'
          });
        }
      } else {
        console.warn(`❌ No content received for cluster ${i + 1}`);
        labels.push({
          title: `Theme ${i + 1}`,
          summary: 'Theme analysis unavailable'
        });
      }
    }

    console.log('🎯 Theme generation completed. Generated labels:', labels);
    return labels;
  } catch (error) {
    console.error('❌ Error generating theme labels:', error);
    console.error('Full error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: (error as any)?.status,
      type: (error as any)?.type
    });
    return clusters.map((_, index) => ({
      title: `Theme ${index + 1}`,
      summary: 'Theme analysis unavailable due to API error'
    }));
  }
}