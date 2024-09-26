import axios from 'axios';

export function cosineSimilarity(embedding1: number[], embedding2: number[]) {
    if (embedding1.length !== embedding2.length) {
        throw new Error('Embeddings must have the same length');
    }

    const dotProduct = embedding1.reduce((acc, cur, i) => acc + cur * embedding2[i], 0);
    const magnitude1 = Math.sqrt(embedding1.reduce((acc, cur) => acc + cur * cur, 0));
    const magnitude2 = Math.sqrt(embedding2.reduce((acc, cur) => acc + cur * cur, 0));

    return dotProduct / (magnitude1 * magnitude2);
}

export async function embedText(texts: string[]) {
    const openAI_api_key = process.env.OPENAI_API_KEY;
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