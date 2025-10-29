export interface PrototypeStatement {
  id: string;
  author: string;
  content: string;
}

export interface PrototypeVote {
  participantId: string;
  statementId: string;
  vote: number; // -1, 0, 1
}

export interface PrototypeParticipant {
  id: string;
  nVotes: number;
  nAgree: number;
  nDisagree: number;
  nPass: number;
}

export interface PrototypeDiscussion {
  id: string;
  name: string;
  description: string;
  statements: PrototypeStatement[];
  votes: PrototypeVote[];
  participants: PrototypeParticipant[];
}

// Parse CSV text into array of objects
function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = values[index]?.trim().replace(/^"|"$/g, '') || '';
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

// Fetch and parse all CSV data for a discussion
export async function loadPrototypeDiscussion(discussionId: string): Promise<PrototypeDiscussion> {
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

    // Parse statements
    const statementsData = parseCSV(statementsText);
    const statements: PrototypeStatement[] = statementsData.map(row => ({
      id: row.statement_id,
      author: row.author,
      content: row.statement_text
    }));

    // Parse votes
    const votes = parseVotesCSV(votesText);

    // Parse participants
    const participantsData = parseCSV(participantsText);
    const participants: PrototypeParticipant[] = participantsData.map(row => ({
      id: row.participant_id,
      nVotes: parseInt(row.n_votes),
      nAgree: parseInt(row.n_agree),
      nDisagree: parseInt(row.n_disagree),
      nPass: parseInt(row.n_pass)
    }));

    return {
      id: discussionId,
      name: "The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery",
      description: "Discussion about automated AI research capabilities and implications",
      statements,
      votes,
      participants
    };
  } catch (error) {
    console.error('Error loading prototype discussion:', error);
    throw error;
  }
}

// Calculate aggregated statistics
export function calculateStatistics(discussion: PrototypeDiscussion) {
  const { statements, votes, participants } = discussion;

  // Calculate statement scores
  const statementScores = statements.map(statement => {
    const statementVotes = votes.filter(v => v.statementId === statement.id);
    const totalScore = statementVotes.reduce((sum, vote) => sum + vote.vote, 0);
    const agreeCount = statementVotes.filter(v => v.vote === 1).length;
    const disagreeCount = statementVotes.filter(v => v.vote === -1).length;
    const passCount = statementVotes.filter(v => v.vote === 0).length;

    return {
      ...statement,
      score: totalScore,
      agreeCount,
      disagreeCount,
      passCount,
      totalVotes: statementVotes.length
    };
  });

  // Sort by score (highest first)
  const topStatements = statementScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const bottomStatements = statementScores
    .sort((a, b) => a.score - b.score)
    .slice(0, 10);

  return {
    totalStatements: statements.length,
    totalParticipants: participants.length,
    totalVotes: votes.length,
    statementScores,
    topStatements,
    bottomStatements,
    averageScore: statementScores.reduce((sum, s) => sum + s.score, 0) / statementScores.length
  };
}