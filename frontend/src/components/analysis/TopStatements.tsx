import { useGraphContext } from "../../contexts/GraphContext";
import { StatementCard } from "./StatementCard";
import { useState } from "react";

export const TopStatements = () => {
  const { analysis } = useGraphContext();
  const [showAll, setShowAll] = useState(false);

  if (!analysis) {
    return null;
  }

  const displayedStatements = showAll
    ? analysis.topStatements
    : analysis.topStatements.slice(0, 5);

  const hasMoreStatements = analysis.topStatements.length > 5;

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
        {displayedStatements.map((statement, index) => (
          <StatementCard
            key={statement.id}
            statement={statement}
            index={index}
          />
        ))}
        {hasMoreStatements && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-2 text-sm text-stone-500 hover:text-stone-700 transition-colors duration-200 flex items-center justify-center gap-1"
          >
            {showAll ? (
              <>
                <span>Show Less</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </>
            ) : (
              <>
                <span>Show More</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
