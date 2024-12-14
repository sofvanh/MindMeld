import { Argument } from '../shared/types';


interface RGBColor {
  r: number;
  g: number;
  b: number;
}

const STONE_400: RGBColor = { r: 168, g: 162, b: 158 };
const EMERALD_500: RGBColor = { r: 16, g: 185, b: 129 };
const ORANGE_500: RGBColor = { r: 249, g: 115, b: 22 };
const YELLOW_400: RGBColor = { r: 250, g: 204, b: 21 };

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
  if (!arg.score) return `rgba(${STONE_400.r}, ${STONE_400.g}, ${STONE_400.b}, 1)`;

  const consensus = arg.score.consensus;
  const fragmentation = arg.score.fragmentation;
  const clarity = arg.score.clarity;

  const consensusColor = blendColors(EMERALD_500, STONE_400, consensus);
  const combinedColor = blendColors(ORANGE_500, consensusColor, fragmentation);

  const interestingnessScore = consensus * fragmentation * 1000;
  const adjustedInterestingnessScore = Math.min(interestingnessScore, 250)
  const interestingnessRatio = adjustedInterestingnessScore / 250;
  const finalColor = blendColors(YELLOW_400, combinedColor, interestingnessRatio);

  return `rgba(${finalColor.r}, ${finalColor.g}, ${finalColor.b}, ${clarity})`;
}