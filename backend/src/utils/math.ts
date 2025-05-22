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

  const result = similarity.arraySync() as number[][];

  // Dispose tensors to free memory
  matrixTensor.dispose();
  dotProduct.dispose();
  magnitude.dispose();
  magnitudeProduct.dispose();
  similarity.dispose();

  return result;
}

export function normalizedCosineSimilarityMatrix(matrix: number[][]) {
  // First calculate the similarity matrix
  const similarityMatrix = cosineSimilarityMatrix(matrix);

  if (similarityMatrix.length === 0 || similarityMatrix[0].length === 0) {
    return [[]];
  }

  // Find the minimum and maximum values in the matrix
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < similarityMatrix.length; i++) {
    for (let j = 0; j < similarityMatrix[i].length; j++) {
      min = Math.min(min, similarityMatrix[i][j]);
      max = Math.max(max, similarityMatrix[i][j]);
    }
  }

  // Handle edge case where matrix is constant (max == min)
  if (max === min) {
    // Return a matrix of all zeros
    return similarityMatrix.map(row => row.map(() => 0));
  }

  // Normalize the matrix to [-1, 1] range
  const normalizedMatrix = similarityMatrix.map(row =>
    row.map(value => 2 * (value - min) / (max - min) - 1)
  );

  return normalizedMatrix;
}

export function computeAllSums(similarityMatrix: number[][], votingMatrix: number[][]) {
  if (similarityMatrix.length === 0 || similarityMatrix[0].length === 0
    || votingMatrix.length === 0 || votingMatrix[0].length === 0) {
    return {
      sum_pos_pos: [[]],
      sum_pos_neg: [[]],
      sum_neg_pos: [[]],
      sum_neg_neg: [[]]
    };
  }

  const S = tf.tensor2d(similarityMatrix);
  const V = tf.tensor2d(votingMatrix);

  // Create masks for positive and negative similarity
  const S_pos = S.maximum(0);
  const S_neg = S.minimum(0);

  // Create masks for positive and negative votes
  const V_pos = V.equal(1).cast('float32');
  const V_neg = V.equal(-1).cast('float32');

  // Calculate sums
  const sum_pos_pos = tf.matMul(S_pos, V_pos).abs();
  const sum_pos_neg = tf.matMul(S_pos, V_neg).abs();
  const sum_neg_pos = tf.matMul(S_neg, V_pos).abs();
  const sum_neg_neg = tf.matMul(S_neg, V_neg).abs();

  const result = {
    sum_pos_pos: sum_pos_pos.arraySync() as number[][],
    sum_pos_neg: sum_pos_neg.arraySync() as number[][],
    sum_neg_pos: sum_neg_pos.arraySync() as number[][],
    sum_neg_neg: sum_neg_neg.arraySync() as number[][]
  };

  // Dispose tensors to free memory
  S.dispose();
  V.dispose();
  S_pos.dispose();
  S_neg.dispose();
  V_pos.dispose();
  V_neg.dispose();
  sum_pos_pos.dispose();
  sum_pos_neg.dispose();
  sum_neg_pos.dispose();
  sum_neg_neg.dispose();

  return result;
}
