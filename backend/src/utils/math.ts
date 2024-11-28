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

export function cosineSimilarityMatrix(matrix: number[][]) {
    if (matrix.length === 0 || matrix[0].length === 0) {
      return [[]];
    }
    const matrixTensor = tf.tensor2d(matrix);
    const dotProduct = tf.matMul(matrixTensor, matrixTensor.transpose());

    const magnitude = tf.sqrt(tf.sum(tf.square(matrixTensor), 1, true));
    const magnitudeProduct = tf.matMul(magnitude, magnitude.transpose());
    
    const similarity = dotProduct.div(magnitudeProduct);

    // Dispose tensors to free memory
    matrixTensor.dispose();
    dotProduct.dispose();
    magnitude.dispose();
    magnitudeProduct.dispose();

    return similarity.arraySync() as number[][];
  }