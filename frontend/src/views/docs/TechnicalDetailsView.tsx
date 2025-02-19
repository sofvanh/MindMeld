import React from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import DocsLayout from './DocsLayout';

const TechnicalDetailsView: React.FC = () => {
  usePageTitle('Technical Details - Nexus Docs');

  return (
    <DocsLayout>
      <div className="relative px-4 max-w-screen-md mx-auto my-16">
        <h1 id="technical-details">Technical Details</h1>
        <div className="prose prose-stone max-w-none">
          <p>This section will explain, in detail, how the graph is formed, and how scores are assigned to statements.</p>

          <h2 id="graph-structure">Graph Structure</h2>
          <p>The graph structure is formed by a rank-based linking algorithm that connects semantically similar statements to each other.</p>
          <p>Every statement gets a semantic embedding from a large language model, and each of these embeddings is compared to each other using cosine similarity as a distance metric.</p>

          <h3>Rank-based Linking</h3>
          <p>For each statement, all other statements are ranked from most similar to most different. These ranks are represented as whole numbers from 1 to N-1.</p>
          <p>Next, each potential connection between two statements A and B gets a mutual rank score:</p>
          <pre><code>mutualRank = rankAtoB + rankBtoA</code></pre>
          <p>Finally, a fixed 2*N connections are assigned to the pairs of statements with the lowest mutual rank scores, giving each node an average of four connections.</p>

          <h3>Quality-based filtering</h3>
          <p>In addition to rank-based linking, the algorithm also performs a soft filtering of low-quality statements.</p>
          <p>A discount factor is applied to the mutual rank score, based on the quality score of each statement in the pair. Lower quality statements will thus receive fewer connections.</p>
          <pre><code>adjustedMutualRank = (rankAtoB + rankBtoA) / (qualityA * qualityB)</code></pre>
          <p>Furthermore, to offset the effects of this filtering, the total number of connections is also lowered:</p>
          <p><pre><code>totalConnections = 2 * N * averageQuality</code></pre></p>

          <h2 id="statement-scores">Statement Scores</h2>
          <p>User reactions are used to compute scores for each statement. <b>These scores are a signal for how surprising the reactions were</b>, given how users have reacted to other statements. Each statement will get three scores:</p>
          <ul className="styled-list">
            <li><strong>Consensus:</strong> How much surprising agreement was there between users?</li>
            <li><strong>Divergence:</strong> How much surprising disagreement was there between users?</li>
            <li><strong>Quality:</strong> Did users generally considered the statement to be high-quality?</li>
          </ul>
          <p>First, reactions of the type "agree" and "disagree" are called votes, and are used to form a unique vote profile for each user. These profiles are then used to compute how surprising each of their individual votes are, values which will then be aggregated into the final statement scores.</p>

          <h3>User Profiles</h3>
          <p>Each user's votes are used to form an individual vote profile. A user's vote profile is a vector recording how they voted on every statement:</p>
          <ul className="styled-list">
            <li>1 for agree</li>
            <li>-1 for disagree</li>
            <li>0 otherwise</li>
          </ul>
          <p>These profiles are then used to compute a similarity matrix, which records how similar each of the users are to every other. Two users' similarity is determined by taking the cosine similarity between their vote profiles. This produces a value ranging from -1 to 1, reflecting how much they tend to agree.</p>

          <h3>Vote Surprisal</h3>
          <p>When a user votes on a statement, the following is done to compute how surprising their vote was:</p>
          <p>First, all users who voted on the statement are partitioned into two groups:</p>
          <ul className="styled-list">
            <li><strong>In-group:</strong> Users who have a positive similarity. All users are considered to be in their own in-group (similarity score of 1).</li>
            <li><strong>Out-group:</strong> Users who have a negative similarity.</li>
          </ul>

          <h4>Consensus (user)</h4>
          <p>A user's vote is expected to differ from their out-group. When this expectation is violated, this is called consensus.</p>
          <p>A user's consensus score is equal to <b>the fraction of their out-group they agreed with</b>, weighted by the magnitude of the similarity of their vote profiles (highly dissimilar users count for more).</p>

          <h4>Divergence (user)</h4>
          <p>A user's vote is expected to align with their in-group. When this expectation is violated, this is called divergence.</p>
          <p>A user's divergence score is equal to <b>the fraction of their in-group they disagreed with</b>, weighted by the similarity of their vote profiles (highly similar users count for more).</p>

          <h3>Quality (user)</h3>
          <p>How a user reacted is also used to determine what they considered the quality of the statement to be:</p>
          <ul className="styled-list">
            <li>Flagging a statement as low-quality explicitly gives that statement a score of 0</li>
            <li>Voting agree/disagree without flagging it as low-quality implicitly gives that statement a score of 1</li>
          </ul>
          <p>These values will later be aggregated across all users who reacted.</p>

          <h3>Aggregating Scores</h3>
          <p>Finally, these user-specific values are aggregated together to assign scores to a statement. The final scores are aggregated by taking a weighted average of user scores, weighting each user by how unique their vote profile is among all the users who voted.</p>
          <p>The uniqueness of a user's vote profile is determined by measuring the size of their ingroup, or the sum of all positive similarity scores.</p>
          <pre><code>Uniqueness = 1 / ingroupSize</code></pre>
          <p>This uniqueness value will differ between statements, since every statement will have a different subset of users voting on it.</p>

          <h4>Additional Notes</h4>
          <p>First, the set of users considered for each score of a given statement is not necessarily the same. Users who flagged a statement as low-quality, but did not vote, will only be considered when calculating the quality score, but not for the consensus or divergence scores. Furthermore, not all users will have an out-group, in which case they will not be included in computing the consensus score.</p>
          <p>Finally, to ensure that each of the scores sits on the range 0 to 1, the diverge score is scaled up by a factor of 2 (maximum possible divergence is 0.5 otherwise).</p>
        </div>
      </div>
    </DocsLayout>
  );
};

export default TechnicalDetailsView;
