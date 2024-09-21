export function cosineSimilarity(embedding1: number[], embedding2: number[]) {
    if (embedding1.length !== embedding2.length) {
        throw new Error('Embeddings must have the same length');
    }

    const dotProduct = embedding1.reduce((acc, cur, i) => acc + cur * embedding2[i], 0);
    const magnitude1 = Math.sqrt(embedding1.reduce((acc, cur) => acc + cur * cur, 0));
    const magnitude2 = Math.sqrt(embedding2.reduce((acc, cur) => acc + cur * cur, 0));

    return dotProduct / (magnitude1 * magnitude2);
}

// Placeholder - assigns random embeddings to nodes
export function embedText(text: string) {
    return Array.from({ length: 100 }, () => Math.random());
}