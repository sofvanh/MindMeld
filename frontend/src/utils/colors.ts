import { Argument } from '../shared/types';


interface RGBColor {
  r: number;
  g: number;
  b: number;
}

const SLATE_400: RGBColor = { r: 148, g: 163, b: 184 };
const CYAN_500: RGBColor = { r: 6, g: 182, b: 212 };
const ROSE_400: RGBColor = { r: 251, g: 113, b: 133 };
const AMBER_500: RGBColor = { r: 245, g: 158, b: 11 };

function blendValues(val1: number, val2: number, ratio: number): number {
  return Math.round(val1 * ratio + val2 * (1 - ratio))
}

function blendColors(col1: RGBColor, col2: RGBColor, ratio: number): RGBColor {
  return {
    r: blendValues(col1.r, col2.r, ratio),
    g: blendValues(col1.g, col2.g, ratio),
    b: blendValues(col1.b, col2.b, ratio)
  };
}

export function getColor(arg: Argument): string {
  if (!arg.score) return `rgba(${SLATE_400.r}, ${SLATE_400.g}, ${SLATE_400.b}, 1)`;

  const consensus = arg.score.consensus;
  const fragmentation = arg.score.fragmentation;
  const clarity = arg.score.clarity;

  const consensusColor = blendColors(CYAN_500, SLATE_400, consensus);
  const combinedColor = blendColors(ROSE_400, consensusColor, fragmentation);

  const interestingnessScore = consensus * fragmentation * 1000;
  const adjustedInterestingnessScore = Math.min(interestingnessScore, 250)
  const interestingnessRatio = adjustedInterestingnessScore / 250;
  const finalColor = blendColors(AMBER_500, combinedColor, interestingnessRatio);

  return `rgba(${finalColor.r}, ${finalColor.g}, ${finalColor.b}, ${clarity})`;
}