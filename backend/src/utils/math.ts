import * as tf from '@tensorflow/tfjs-node';

export function cosineSimilarity(vector1: number[], vector2: number[]) {
    if (vector1.length !== vector2.length) {
      throw new Error('Embeddings must have the same length');
    }
  
    // Convert arrays to tensors
    const tensor1 = tf.tensor1d(vector1);
    const tensor2 = tf.tensor1d(vector2);
  
    // Calculate dot product and magnitudes using TensorFlow
    const dotProduct = tf.dot(tensor1, tensor2).dataSync()[0];
    const magnitude1 = tf.norm(tensor1).dataSync()[0];
    const magnitude2 = tf.norm(tensor2).dataSync()[0];
  
    // Dispose tensors to free memory
    tensor1.dispose();
    tensor2.dispose();
  
    return dotProduct / (magnitude1 * magnitude2);
  }