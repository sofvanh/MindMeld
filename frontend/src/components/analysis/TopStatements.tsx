import { useGraphContext } from "../../contexts/GraphContext";
import { PiThumbsUp, PiThumbsDown, PiQuestion } from "react-icons/pi";
import { getColor } from "../../utils/colors";

export const TopStatements = () => {
  const { analysis } = useGraphContext();

  if (!analysis) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg sm:shadow-sm sm:border sm:border-stone-200 sm:p-4">
      <h4 className="text-lg font-semibold">Top Statements</h4>
      <small className="block mb-4">These statements have the highest combined consensus and divergence, which means they are most likely to be <i>de-polarizing</i> (= reduce polarization in the discussion) as well as <i>cruxy</i> (= they hint at important aspects of the discussion).</small>
      <div className="flex flex-col gap-4">
        {analysis.topStatements.length === 0 && (
          <div className="p-4 rounded-lg border border-stone-200 bg-stone-50">
            <p className="text-center text-stone-600 m-0">
              No top statements found. This could be because there aren't enough reactions yet,
              or the statements don't have sufficient consensus, divergence, and quality scores.
            </p>
          </div>
        )}
        {analysis.topStatements.map((statement, index) => (
          <div
            key={statement.id}
            className="p-4 rounded-lg border border-stone-200"
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
        ))}
      </div>
    </div >
  );
};
