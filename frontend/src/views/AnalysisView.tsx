import React, { useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useGraphContext } from '../contexts/GraphContext';
import { ScoreTrendsGraph } from '../components/analysis/ScoreTrendsGraph';
import { PiWarningDuotone } from "react-icons/pi";
import { GraphInfo } from '../components/analysis/GraphInfo';

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
      <div className="max-w-screen-lg mx-auto w-full flex flex-col gap-8">
        <h2 className="text-2xl font-bold mb-6">Graph Analysis</h2>
        <GraphInfo />
        <ScoreTrendsGraph />
      </div>
    </div>
  );
};

export default AnalysisView;
