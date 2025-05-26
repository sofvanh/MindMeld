import React, { useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useGraphContext } from '../contexts/GraphContext';
import { ScoreTrendsGraph } from '../components/analysis/ScoreTrendsGraph';
import { GraphInfo } from '../components/analysis/GraphInfo';
import { TopStatements } from '../components/analysis/TopStatements';
import ErrorMessage from '../components/ErrorMessage';


export const AnalysisView: React.FC = () => {
  const { graph, analysis, loading, error } = useGraphContext();

  useEffect(() => {
    document.title = graph?.name ? `${graph.name} - Analysis - Nexus` : 'Loading analysis... - Nexus';
    return () => { document.title = 'Nexus'; };
  }, [graph?.name]);

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-grow">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!analysis) {
    return <ErrorMessage title="Analysis Not Available" message="We couldn't load the analysis for this graph. Please try again later." />;
  }

  return (
    <div className="w-full relative flex flex-col flex-grow p-6">
      <div className="max-w-screen-lg mx-auto w-full flex flex-col gap-8">
        <h2 className="text-2xl font-bold mb-6">Graph Analysis</h2>
        <GraphInfo />
        <TopStatements />
        <ScoreTrendsGraph />
      </div>
    </div>
  );
};

export default AnalysisView;
