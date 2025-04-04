import { useGraphContext } from "../../contexts/GraphContext";
import { StatementCard } from "./StatementCard";

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
          <StatementCard
            key={statement.id}
            statement={statement}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};
