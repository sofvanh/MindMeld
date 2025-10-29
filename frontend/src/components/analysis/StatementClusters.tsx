import React, { useMemo, useState, useEffect } from 'react';
import { useGraphContext } from '../../contexts/GraphContext';
import { clusterStatements, EmbeddingResult, generateThemeLabels, ThemeLabel } from '../../services/embeddingsService';
import { Argument } from '../../shared/types';

interface ClusterProps {
  cluster: Argument[];
  index: number;
  themeLabel?: ThemeLabel;
}

const Cluster: React.FC<ClusterProps> = ({ cluster, index, themeLabel }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const clusterTitle = themeLabel?.title || `Theme ${index + 1}`;
  const averageAgreement = cluster.reduce((sum, arg) => {
    const total = (arg.reactionCounts?.agree || 0) + (arg.reactionCounts?.disagree || 0) + (arg.reactionCounts?.unclear || 0);
    return sum + (total > 0 ? (arg.reactionCounts?.agree || 0) / total : 0);
  }, 0) / cluster.length;

  return (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-semibold text-gray-800">{clusterTitle}</h4>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>{cluster.length} statements</span>
                <span>•</span>
                <span className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                  {Math.round(averageAgreement * 100)}%
                </span>
              </div>
            </div>
            {isExpanded && themeLabel?.summary && (
              <p className="text-sm text-gray-600 mt-2">{themeLabel.summary}</p>
            )}
          </div>
          <div className="ml-4 text-gray-400">
            {isExpanded ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {cluster.map((statement) => (
            <div key={statement.id} className="p-3 bg-gray-50 rounded border-l-4 border-blue-200">
              <p className="text-sm text-gray-800 mb-2">{statement.statement}</p>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>👍 {statement.reactionCounts?.agree || 0}</span>
                <span>👎 {statement.reactionCounts?.disagree || 0}</span>
                <span>❓ {statement.reactionCounts?.unclear || 0}</span>
                <span className="ml-auto">
                  Clarity: {Math.round((statement.score?.clarity || 0) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const StatementClusters: React.FC = () => {
  const { graph } = useGraphContext();
  const [themeLabels, setThemeLabels] = useState<ThemeLabel[]>([]);
  const [labelsLoading, setLabelsLoading] = useState(false);

  const clusters = useMemo(() => {
    if (!graph?.arguments || graph.arguments.length === 0) {
      return [];
    }

    // Filter arguments that have embeddings
    const argumentsWithEmbeddings = graph.arguments.filter(arg =>
      arg.embedding && arg.embedding.length > 0
    );

    if (argumentsWithEmbeddings.length === 0) {
      return [];
    }

    // Convert to EmbeddingResult format for clustering
    const embeddingResults: EmbeddingResult[] = argumentsWithEmbeddings.map(arg => ({
      id: arg.id,
      text: arg.statement,
      embedding: arg.embedding
    }));

    // Cluster with a similarity threshold of 0.6
    const rawClusters = clusterStatements(embeddingResults, 0.6);

    // Convert back to Argument format and filter out single-statement clusters for cleaner display
    return rawClusters
      .filter(cluster => cluster.length > 1) // Only show clusters with multiple statements
      .map(cluster =>
        cluster.map(item =>
          argumentsWithEmbeddings.find(arg => arg.id === item.id)!
        )
      );
  }, [graph?.arguments]);

  // Generate theme labels when clusters change
  useEffect(() => {
    if (clusters.length > 0) {
      setLabelsLoading(true);

      // Convert clusters to EmbeddingResult format for theme generation
      const embeddingClusters = clusters.map(cluster =>
        cluster.map(arg => ({
          id: arg.id,
          text: arg.statement,
          embedding: arg.embedding
        }))
      );

      generateThemeLabels(embeddingClusters)
        .then(labels => {
          setThemeLabels(labels);
          setLabelsLoading(false);
        })
        .catch(error => {
          console.error('Failed to generate theme labels:', error);
          setLabelsLoading(false);
        });
    }
  }, [clusters]);

  if (!graph) {
    return null;
  }

  if (clusters.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Statement Clusters</h3>
        <p className="text-gray-600">
          {graph.arguments.some(arg => arg.embedding && arg.embedding.length > 0)
            ? "No clusters found with current similarity threshold. Statements are quite diverse."
            : "Embeddings are being generated. Refresh to see clusters."
          }
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Statement Clusters</h3>
        <p className="text-sm text-gray-600">
          Similar statements grouped together using AI embeddings.
          Clusters show {clusters.length} thematic groups from {graph.arguments.length} total statements.
          {labelsLoading && " Generating theme descriptions..."}
        </p>
      </div>

      {clusters.map((cluster, index) => (
        <Cluster
          key={index}
          cluster={cluster}
          index={index}
          themeLabel={themeLabels[index]}
        />
      ))}
    </div>
  );
};