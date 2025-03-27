import { customAlphabet } from 'nanoid';

const generateCustomId = (prefix: string): string => {
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);
  const timestamp = Date.now().toString(36);
  const randomPart = nanoid(6);
  return `${prefix}_${timestamp}${randomPart}`;
};

export const parseCustomId = (id: string): { prefix: string, timestamp: string, randomPart: string } => {
  const [prefix, rest] = id.split('_');
  const timestamp = new Date(parseInt(rest.slice(0, -6), 36)).toISOString();
  const randomPart = rest.slice(-6);
  return { prefix, timestamp, randomPart };
};

export const generateUserId = (): string => generateCustomId('usr');
export const generateGraphId = (): string => generateCustomId('gra');
export const generateArgumentId = (): string => generateCustomId('arg');
export const generateEdgeId = (): string => generateCustomId('edg');
export const generateReactionId = (): string => generateCustomId('rct');
