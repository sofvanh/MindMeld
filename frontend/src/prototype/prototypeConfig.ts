export interface PrototypeDiscussionMeta {
  id: string;
  name: string;
  description: string;
  participantCount: number;
  statementCount: number;
  isPrototype: true;
}

// Configuration of available prototype discussions
export const PROTOTYPE_DISCUSSIONS: PrototypeDiscussionMeta[] = [
  {
    id: 'ai-scientist-discussion',
    name: 'The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery',
    description: 'Discussion about automated AI research capabilities and implications',
    participantCount: 10,
    statementCount: 20,
    isPrototype: true
  }
  // Add more discussions here as you add more CSV files
];

export function getPrototypeDiscussionById(id: string): PrototypeDiscussionMeta | undefined {
  return PROTOTYPE_DISCUSSIONS.find(d => d.id === id);
}

export function isPrototypeDiscussion(id: string): boolean {
  return PROTOTYPE_DISCUSSIONS.some(d => d.id === id);
}