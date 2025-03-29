import { useGraphContext } from "../../contexts/GraphContext";

export const GraphInfo: React.FC = () => {
  const { analysis } = useGraphContext();

  if (!analysis) {
    return (
      <p>Error loading graph info</p>
    );
  }

  return (
    <div className="bg-white rounded-lg sm:shadow-sm sm:border sm:border-stone-200 sm:p-4">
      <h4>Graph Stats</h4>
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <span className="text-lg font-bold">{analysis.contributorCount}</span> <small>contributors</small>
        </div>
        <div>
          <span className="text-lg font-bold">{analysis.statementCount}</span> <small>statements</small>
        </div>
        <div>
          <span className="text-lg font-bold">{analysis.reactionCount}</span> <small>reactions</small>
        </div>
        <div>
          <span className="text-lg font-bold">{new Date(analysis.createdAt || '').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span> <small>date created</small>
        </div>
      </div>
    </div>
  );
};
