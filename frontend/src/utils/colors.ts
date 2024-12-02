import { Argument } from '../shared/types';

export function getColor(arg: Argument) {
  if (!arg.score) return 'rgba(148, 163, 184, 1)'; // slate-400

  const consensus = arg.score.consensus === 0 ? 0.01 : arg.score.consensus;
  const fragmentation = arg.score.fragmentation === 0 ? 0.01 : arg.score.fragmentation;
  const totalIntensity = consensus + fragmentation;

  let normalizedConsensus = consensus;
  let normalizedFragmentation = fragmentation;

  const targetIntensity = Math.min(Math.max(totalIntensity, 0.3), 1.6);
  const scaleFactor = targetIntensity / totalIntensity;
  normalizedConsensus *= scaleFactor;
  normalizedFragmentation *= scaleFactor;

  const blue500 = { r: 59, g: 130, b: 246 };
  const orange500 = { r: 249, g: 115, b: 22 };

  const r = Math.round(blue500.r * normalizedConsensus + orange500.r * normalizedFragmentation);
  const g = Math.round(blue500.g * normalizedConsensus + orange500.g * normalizedFragmentation);
  const b = Math.round(blue500.b * normalizedConsensus + orange500.b * normalizedFragmentation);

  let opacity = arg.score.clarity ?? 0;
  opacity = Math.max(opacity, 0.2);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
