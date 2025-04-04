import { PiThumbsUp, PiThumbsDown, PiQuestion } from "react-icons/pi";
import { getColor } from "../../utils/colors";
import { Argument } from "../../shared/types";

interface StatementCardProps {
  statement: Argument;
  index: number;
}

export const StatementCard = ({ statement, index }: StatementCardProps) => {
  return (
    <div
      className="p-4 rounded-lg border border-stone-200 animate-fade-in-up"
      style={{ borderLeftColor: getColor(statement), borderLeftWidth: '6px' }}
    >
      <div className="flex items-start gap-3">
        <div className="text-sm font-medium text-stone-500 mt-1">{index + 1}</div>
        <div className="flex-1">
          <p className="m-0 mb-1 font-medium">{statement.statement}</p>
          <div className="flex flex-wrap items-center">
            <div className="flex items-center gap-1 mr-4">
              <PiThumbsUp className="text-emerald-500" />
              <small className="mr-2">{statement.reactionCounts?.agree || 0}</small>
              <PiThumbsDown className="text-red-500" />
              <small className="mr-2">{statement.reactionCounts?.disagree || 0}</small>
              <PiQuestion className="text-amber-500" />
              <small>{statement.reactionCounts?.unclear || 0}</small>
            </div>
            {statement.score && (
              <div className="flex flex-wrap items-center">
                <div className="flex items-center gap-1 mr-4">
                  <small className="font-medium">Consensus</small>
                  <small>{(statement.score.consensus || 0).toFixed(2)}</small>
                </div>
                <div className="flex items-center gap-1 mr-4">
                  <small className="font-medium">Divergence</small>
                  <small>{(statement.score.fragmentation || 0).toFixed(2)}</small>
                </div>
                <div className="flex items-center gap-1">
                  <small className="font-medium">Quality</small>
                  <small>{(statement.score.clarity || 0).toFixed(2)}</small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
