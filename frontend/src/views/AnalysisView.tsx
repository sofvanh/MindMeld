import React, { useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useGraphContext } from '../contexts/GraphContext';
import { ScoreTrendsGraph } from '../components/analysis/ScoreTrendsGraph';
import { PiWarningDuotone } from "react-icons/pi";


export const AnalysisView: React.FC = () => {
  const { graph, analysis, loading } = useGraphContext();

  useEffect(() => {
    document.title = graph?.name ? `${graph.name} - Analysis - Nexus` : 'Loading analysis... - Nexus';
    return () => { document.title = 'Nexus'; };
  }, [graph?.name]);

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-grow">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="flex flex-col items-center justify-center text-center px-4">
          <PiWarningDuotone className="text-red-500 text-4xl mb-4" />
          <h3 className="mb-0">Analysis Not Available</h3>
          <p>We couldn't load the analysis for this graph. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative flex flex-col flex-grow p-6">
      <div className="max-w-screen-lg mx-auto w-full">
        <h2 className="text-2xl font-bold mb-6">Graph Analysis</h2>

        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4 mb-4">
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-sm text-stone-500">Statements</p>
              <p className="text-xl font-bold">{analysis?.statementCount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-stone-500">Contributors</p>
              <p className="text-xl font-bold">{analysis?.contributorCount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-stone-500">Reactions</p>
              <p className="text-xl font-bold">{analysis?.reactionCount}</p>
            </div>
          </div>
        </div>
        <ScoreTrendsGraph />
      </div>
    </div>
  );
};

export default AnalysisView;
