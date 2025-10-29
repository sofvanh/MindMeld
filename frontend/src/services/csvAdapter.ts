import { GraphData, Argument, Analysis, Edge, Post } from '../shared/types';
import { generateEmbeddings, generateSimilarityEdges } from './embeddingsService';

interface PrototypeVote {
  participantId: string;
  statementId: string;
  vote: number; // -1, 0, 1
}


// CSV prototype discussions configuration
export const CSV_DISCUSSIONS = [
  {
    id: 'ai-scientist-discussion',
    name: 'The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery',
    description: 'Discussion about automated AI research capabilities and implications for scientific discovery',
    participantCount: 10,
    statementCount: 29,
    isPrototype: true
  },
  {
    id: 'recursive-reasoning-discussion',
    name: 'Less is More: Recursive Reasoning with Tiny Networks',
    description: 'Discussion about TRM performance, parameter efficiency, and alternatives to transformer architectures',
    participantCount: 20,
    statementCount: 9,
    isPrototype: true
  }
];

// Check if a discussion ID is a CSV prototype
export function isCsvDiscussion(graphId: string): boolean {
  return CSV_DISCUSSIONS.some(d => d.id === graphId);
}

// Parse CSV text into array of objects
function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    // Better CSV parsing that handles quoted values with commas
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add the last value

    const obj: any = {};
    headers.forEach((header, index) => {
      let value = values[index] || '';
      // Remove surrounding quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      obj[header.trim()] = value;
    });
    return obj;
  });
}

// Parse votes CSV (special matrix format)
function parseVotesCSV(csvText: string): PrototypeVote[] {
  const lines = csvText.trim().split('\n');
  const statementIds = lines[0].split(',').slice(1); // Skip participant_id column

  const votes: PrototypeVote[] = [];

  lines.slice(1).forEach(line => {
    const values = line.split(',');
    const participantId = values[0];

    statementIds.forEach((statementId, index) => {
      const vote = parseInt(values[index + 1]);
      if (!isNaN(vote)) {
        votes.push({
          participantId,
          statementId,
          vote
        });
      }
    });
  });

  return votes;
}

// Load CSV discussion data and convert to Nexus format
export async function loadCsvDiscussion(graphId: string): Promise<{ graph: GraphData; analysis: Analysis; edges: Edge[] }> {
  try {
    // Fetch all CSV files
    const [statementsRes, votesRes, participantsRes] = await Promise.all([
      fetch('/data/statements_csv.txt'),
      fetch('/data/votes_csv.txt'),
      fetch('/data/participants_csv.txt')
    ]);

    const [statementsText, votesText, participantsText] = await Promise.all([
      statementsRes.text(),
      votesRes.text(),
      participantsRes.text()
    ]);

    // Parse data
    const statementsData = parseCSV(statementsText);
    const votes = parseVotesCSV(votesText);
    const participantsData = parseCSV(participantsText);

    // Generate embeddings for all statements
    const statementTexts = statementsData.map(row => row.statement_text);
    const statementIds = statementsData.map(row => row.statement_id);

    console.log('Generating embeddings for', statementTexts.length, 'statements');
    const embeddingResults = await generateEmbeddings(statementTexts, statementIds);

    // Convert to Nexus Argument format with embeddings and posts
    const args: Argument[] = statementsData.map(row => {
      const statementVotes = votes.filter(v => v.statementId === row.statement_id);
      const agreeCount = statementVotes.filter(v => v.vote === 1).length;
      const disagreeCount = statementVotes.filter(v => v.vote === -1).length;
      const unclearCount = statementVotes.filter(v => v.vote === 0).length;
      const total = agreeCount + disagreeCount + unclearCount;

      // Find the embedding for this statement
      const embeddingResult = embeddingResults.find(e => e.id === row.statement_id);

      // Parse source posts if they exist
      let sourcePosts: Post[] = [];
      if (row.source_posts && row.post_urls) {
        const postUris = row.source_posts.split('|');
        const postUrls = row.post_urls.split('|');

        sourcePosts = postUris.map((uri: string, index: number) => ({
          uri: uri.trim(),
          url: postUrls[index]?.trim() || '',
          authorId: row.author
        }));
      }

      return {
        id: row.statement_id,
        statement: row.statement_text,
        graphId: graphId,
        embedding: embeddingResult?.embedding || [], // Use generated embedding
        authorId: row.author,
        sourcePosts: sourcePosts,
        reactionCounts: {
          agree: agreeCount,
          disagree: disagreeCount,
          unclear: unclearCount
        },
        score: {
          consensus: total > 0 ? agreeCount / total : 0,
          fragmentation: total > 0 ? Math.abs(agreeCount - disagreeCount) / total : 0,
          clarity: total > 0 ? (agreeCount + disagreeCount) / total : 0
        }
      };
    });

    // Create graph data
    const discussionConfig = CSV_DISCUSSIONS.find(d => d.id === graphId);
    const graph: GraphData = {
      id: graphId,
      name: discussionConfig?.name || 'CSV Discussion',
      argumentCount: statementsData.length,
      reactionCount: votes.length,
      lastActivity: Date.now(),
      isPrivate: false
    };

    // Generate similarity-based edges for graph visualization
    console.log('Generating similarity-based edges for graph visualization');
    const similarityEdges = generateSimilarityEdges(embeddingResults, 0.5, 3);

    // Convert to Edge format
    const edges = similarityEdges.map((edge, index) => ({
      id: `edge-${index}`,
      graphId: graphId,
      sourceId: edge.sourceId,
      targetId: edge.targetId
    }));

    console.log(`Generated ${edges.length} similarity-based edges`);

    // Create analysis data
    const sortedByClarity = [...args].sort((a, b) => (b.score?.clarity || 0) - (a.score?.clarity || 0));

    const analysis: Analysis = {
      statementCount: args.length,
      reactionCount: votes.length,
      contributorCount: participantsData.length,
      createdAt: new Date().toISOString(),
      topStatements: sortedByClarity // Return all statements, sorted by clarity
    };

    return { graph, analysis, edges };
  } catch (error) {
    console.error('Error loading CSV discussion:', error);
    throw error;
  }
}