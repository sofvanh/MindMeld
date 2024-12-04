import { Argument } from '../shared/types';

export function getColor(arg: Argument) {
  if (!arg.score) return 'rgba(148, 163, 184, 1)'; // slate-400

  const consensus = arg.score.consensus === 0 ? 0.01 : arg.score.consensus;
  const fragmentation = arg.score.fragmentation === 0 ? 0.01 : arg.score.fragmentation;
  const totalIntensity = consensus + fragmentation;

  let normalizedConsensus = consensus;
  let normalizedFragmentation = fragmentation;

  const targetIntensity = Math.min(Math.max(totalIntensity, 0.7), 1.6);
  const scaleFactor = targetIntensity / totalIntensity;
  normalizedConsensus *= scaleFactor;
  normalizedFragmentation *= scaleFactor;

  // Define our four corner colors
  const bottomLeft = { r: 148, g: 163, b: 184 };  // slate-400: (0,0)
  const topLeft = { r: 6, g: 182, b: 212 };       // cyan-500: (100,0)
  const bottomRight = { r: 251, g: 113, b: 133 }; // rose-400: (0,100)
  const topRight = { r: 245, g: 158, b: 11 };     // amber-500: (100,100)

  // Blend between top corners and bottom corners first
  const bottomR = Math.round(bottomLeft.r * (1 - normalizedFragmentation) + bottomRight.r * normalizedFragmentation);
  const bottomG = Math.round(bottomLeft.g * (1 - normalizedFragmentation) + bottomRight.g * normalizedFragmentation);
  const bottomB = Math.round(bottomLeft.b * (1 - normalizedFragmentation) + bottomRight.b * normalizedFragmentation);

  const topR = Math.round(topLeft.r * (1 - normalizedFragmentation) + topRight.r * normalizedFragmentation);
  const topG = Math.round(topLeft.g * (1 - normalizedFragmentation) + topRight.g * normalizedFragmentation);
  const topB = Math.round(topLeft.b * (1 - normalizedFragmentation) + topRight.b * normalizedFragmentation);

  // Then blend between top and bottom
  const r = Math.round(bottomR * (1 - normalizedConsensus) + topR * normalizedConsensus);
  const g = Math.round(bottomG * (1 - normalizedConsensus) + topG * normalizedConsensus);
  const b = Math.round(bottomB * (1 - normalizedConsensus) + topB * normalizedConsensus);

  let opacity = arg.score.clarity ?? 0;
  opacity = Math.max(opacity, 0.2);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}