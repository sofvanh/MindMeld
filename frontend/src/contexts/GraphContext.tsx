import React, { createContext, useContext, useState, useEffect } from 'react';
import { Graph, ForceGraphData, NodeData, LinkData, ReactionAction, UserReaction, ReactionCounts, Argument, Edge, Score, Analysis } from '../shared/types';
import { useWebSocket } from './WebSocketContext';
import { useAuth } from './AuthContext';
import { applyReactionActions } from '../shared/reactionHelper';
import { isCsvDiscussion, loadCsvDiscussion } from '../services/csvAdapter';
import { clusterStatements, EmbeddingResult, generateThemeLabels, ThemeLabel } from '../services/embeddingsService';

interface ClusterInfo {
  id: number;
  arguments: Argument[];
  themeLabel?: ThemeLabel;
  center?: { x: number; y: number };
}

interface GraphContextType {
  graph: Graph | null;
  layoutData: ForceGraphData;
  feed: Argument[] | null;
  analysis: Analysis | null;
  clusters: ClusterInfo[];
  loading: boolean;
  error: string | null;
  addPendingReaction: (reaction: ReactionAction) => void;
  removePendingReaction: (reaction: ReactionAction) => void;
  onNextFeedArgument: () => void;
}

const GraphContext = createContext<GraphContextType | null>(null);

export const useGraphContext = () => {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraphContext must be used within a GraphProvider');
  }
  return context;
};

interface GraphProviderProps {
  children: React.ReactNode;
  graphId: string;
}

export const GraphProvider: React.FC<GraphProviderProps> = ({ children, graphId }) => {
  const { socket } = useWebSocket();
  const { user, loading: userLoading } = useAuth();
  const [serverGraph, setServerGraph] = useState<Graph | null>(null);
  const [pendingReactions, setPendingReactions] = useState<ReactionAction[]>([]);
  const [graph, setGraph] = useState<Graph | null>(null);
  const [layoutData, setLayoutData] = useState<ForceGraphData>({ nodes: [], links: [] });
  const [feed, setFeed] = useState<Argument[] | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [clusters, setClusters] = useState<ClusterInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const addPendingReaction = (reaction: ReactionAction) => {
    setPendingReactions(prev => [...prev, reaction]);
  };

  const removePendingReaction = (reaction: ReactionAction) => {
    setPendingReactions(prev => {
      const index = prev.findIndex(r =>
        r.argumentId === reaction.argumentId &&
        r.reactionType === reaction.reactionType &&
        r.actionType === reaction.actionType
      );
      if (index === -1) return prev;
      return [...prev.slice(0, index), ...prev.slice(index + 1)];
    });
  };

  const applyPendingReactions = (argument: Argument, reactions: ReactionAction[]) => {
    const oldReactionCounts: ReactionCounts = argument.reactionCounts || { agree: 0, disagree: 0, unclear: 0 };
    const oldUserReactions: UserReaction = argument.userReaction || { agree: false, disagree: false, unclear: false };
    const { reactionCounts, userReaction } = applyReactionActions(oldReactionCounts, oldUserReactions, reactions);
    return {
      ...argument,
      reactionCounts,
      userReaction
    };
  };

  const onNextFeedArgument = () => {
    if (!feed || feed.length === 0) return;
    const newFeedArguments = feed.slice(1);
    setFeed(newFeedArguments);
  }

  useEffect(() => {
    if (!serverGraph || Object.keys(pendingReactions).length === 0) {
      setGraph(serverGraph);
      return;
    }

    const updatedArguments = serverGraph.arguments.map(arg => {
      const pendingReaction = pendingReactions.filter(reaction => reaction.argumentId === arg.id);
      if (!pendingReaction.length) return arg;
      const { reactionCounts, userReaction } = applyPendingReactions(arg, pendingReaction);

      return {
        ...arg,
        reactionCounts,
        userReaction
      };
    });

    setGraph({
      ...serverGraph,
      arguments: updatedArguments
    });
  }, [serverGraph, pendingReactions]);

  useEffect(() => {
    if (userLoading) return;

    // Handle CSV discussions differently
    if (isCsvDiscussion(graphId)) {
      console.log('Loading CSV discussion:', graphId);
      const loadCsvData = async () => {
        try {
          console.log('Fetching CSV data...');
          const { graph: csvGraph, analysis: csvAnalysis, edges: csvEdges } = await loadCsvDiscussion(graphId);
          console.log('CSV data loaded:', csvGraph, csvAnalysis, csvEdges);

          // Convert to Graph format for compatibility
          const graph: Graph = {
            id: csvGraph.id,
            name: csvGraph.name,
            arguments: csvAnalysis.topStatements, // Use all arguments from analysis
            edges: csvEdges || [], // Use similarity-based edges or empty array
            isPrivate: csvGraph.isPrivate || false
          };

          console.log('Setting graph state:', graph);
          setServerGraph(graph);
          setFeed(csvAnalysis.topStatements); // Use same arguments for feed
          setAnalysis(csvAnalysis);
          console.log('CSV data loaded and state set');
        } catch (err) {
          console.error('Failed to load CSV discussion:', err);
          setError('Failed to load CSV discussion');
        }
      };

      loadCsvData();
      return; // Don't set up socket listeners for CSV discussions
    }

    // Regular WebSocket-based discussions
    if (!socket) return;

    socket.emit('join graph', { graphId }, (response: any) => {
      if (response.success) {
        setServerGraph(response.data.graph);
      } else {
        console.error('Failed to join graph:', response.error);
        setError(response.error);
      }
    });

    // TODO Getting feed and analysis should happen within join graph
    socket.emit('get feed', { graphId }, (response: any) => {
      if (response.success) {
        setFeed(response.data.arguments);
      } else {
        console.error('Failed to get feed:', response.error);
        setError(response.error);
      }
    });

    socket.emit('get analysis', { graphId }, (response: any) => {
      if (response.success) {
        setAnalysis(response.data.analysis);
      } else {
        console.error('Failed to get analysis:', response.error);
        setError(response.error);
      }
    });

    socket.on('graph update', setServerGraph);
    socket.on('arguments added', ({ newArguments, allGraphEdges }: { newArguments: Argument[], allGraphEdges: Edge[] }) => {
      setServerGraph(prevGraph => {
        if (!prevGraph) return prevGraph;
        return { ...prevGraph, arguments: [...prevGraph.arguments, ...newArguments], edges: allGraphEdges };
      });
    });
    socket.on('user reactions update', ({ argumentIdToUserReaction }: { argumentIdToUserReaction: Record<string, UserReaction> }) => {
      setServerGraph(prevGraph => {
        if (!prevGraph) return prevGraph;
        const updatedArguments = prevGraph.arguments.map(arg => {
          const userReaction = argumentIdToUserReaction[arg.id];
          return userReaction ? { ...arg, userReaction } : arg;
        });
        return { ...prevGraph, arguments: updatedArguments };
      });
    });
    socket.on('graph reactions and scores update', ({ graphReactions, argumentScores }: { graphReactions: Record<string, ReactionCounts>, argumentScores: Record<string, Score> }) => {
      setServerGraph(prevGraph => {
        if (!prevGraph) return prevGraph;
        const updatedArguments: Argument[] = prevGraph.arguments.map(arg => ({
          ...arg,
          reactionCounts: graphReactions[arg.id],
          score: argumentScores[arg.id]
        }));
        return { ...prevGraph, arguments: updatedArguments };
      });
    });

    return () => {
      socket.emit('leave graph', { graphId }, (response: any) => {
        if (!response.success) {
          console.error('Failed to leave graph:', response.error);
          setError(response.error);
        }
      });
      socket.off('graph update');
      socket.off('arguments added');
      socket.off('user reactions update');
      socket.off('graph reactions and scores update');
    };
  }, [socket, graphId, user, userLoading]);

  // Generate clusters when graph changes
  useEffect(() => {
    if (!graph?.arguments || graph.arguments.length === 0) {
      setClusters([]);
      return;
    }

    const generateClusters = async () => {
      console.log('🎯 Generating clusters...');

      // Filter arguments that have embeddings
      const argumentsWithEmbeddings = graph.arguments.filter(arg =>
        arg.embedding && arg.embedding.length > 0
      );

      console.log('  - Arguments with embeddings:', argumentsWithEmbeddings.length);

      if (argumentsWithEmbeddings.length === 0) {
        setClusters([]);
        return;
      }

      // Convert to EmbeddingResult format for clustering
      const embeddingResults: EmbeddingResult[] = argumentsWithEmbeddings.map(arg => ({
        id: arg.id,
        text: arg.statement,
        embedding: arg.embedding
      }));

      // Cluster with a similarity threshold of 0.6
      const rawClusters = clusterStatements(embeddingResults, 0.6);
      console.log('  - Raw clusters:', rawClusters.length, 'clusters with sizes:', rawClusters.map(c => c.length));

      // Generate theme labels for clusters
      const themeLabels = await generateThemeLabels(rawClusters);

      // Convert to ClusterInfo format
      const clusterInfos: ClusterInfo[] = rawClusters
        .filter(cluster => cluster.length > 1) // Only show clusters with multiple statements
        .map((cluster, index) => ({
          id: index,
          arguments: cluster.map(item =>
            argumentsWithEmbeddings.find(arg => arg.id === item.id)!
          ),
          themeLabel: themeLabels[index]
        }));

      console.log('  - Final clusters:', clusterInfos.length);
      console.log('  - Cluster details:', clusterInfos.map(c => ({
        id: c.id,
        title: c.themeLabel?.title,
        argumentIds: c.arguments.map(a => a.id)
      })));

      setClusters(clusterInfos);
    };

    generateClusters().catch(console.error);
  }, [graph?.arguments]);

  useEffect(() => {
    if (!graph) return;

    console.log('🔧 GraphContext: Building layout data');
    console.log('  - Graph arguments:', graph.arguments.length);
    console.log('  - Clusters:', clusters.length);

    // Create statement nodes
    const statementNodes: NodeData[] = graph.arguments.map(arg => {
      const clusterId = clusters.find(cluster =>
        cluster.arguments.some(clusterArg => clusterArg.id === arg.id)
      )?.id;

      return {
        id: arg.id,
        name: arg.statement,
        clusterId,
        type: 'statement'
      };
    });

    // Create post nodes for all posts linked to statements
    const postNodes: NodeData[] = [];
    const postStatementLinks: LinkData[] = [];

    graph.arguments.forEach(arg => {
      if (arg.sourcePosts && arg.sourcePosts.length > 0) {
        arg.sourcePosts.forEach((post, index) => {
          const postNodeId = `post-${arg.id}-${index}`;

          // Create post node
          postNodes.push({
            id: postNodeId,
            name: `@${post.authorId}`,
            type: 'post',
            post: post
          });

          // Create link from post to statement (assume all are supporting for now)
          const statementNode = statementNodes.find(n => n.id === arg.id);
          if (statementNode) {
            postStatementLinks.push({
              source: { id: postNodeId, name: `@${post.authorId}`, type: 'post', post: post },
              target: statementNode,
              type: 'post-statement',
              voteType: 'agree' // For now, assume all posts support their statements
            });
          }
        });
      }
    });

    // Combine all nodes
    const allNodes = [...statementNodes, ...postNodes];

    // Create similarity links between statements
    const similarityLinks: LinkData[] = graph.edges.map(edge => ({
      source: statementNodes.find(arg => arg.id === edge.sourceId) as NodeData,
      target: statementNodes.find(arg => arg.id === edge.targetId) as NodeData,
      type: 'similarity'
    }));

    // Combine all links
    const allLinks = [...similarityLinks, ...postStatementLinks];

    console.log('  - Statement nodes:', statementNodes.length);
    console.log('  - Post nodes:', postNodes.length);
    console.log('  - Similarity links:', similarityLinks.length);
    console.log('  - Post-statement links:', postStatementLinks.length);

    const hasNodesChanged = allNodes.map(node => node.id).sort().join(',') !== layoutData.nodes.map(node => node.id).sort().join(',');
    const hasLinksChanged = allLinks.map(link => `${link.source.id}-${link.target.id}`).sort().join(',') !== layoutData.links.map(link => `${link.source.id}-${link.target.id}`).sort().join(',');
    const hasClusterDataChanged = statementNodes.filter(n => n.clusterId !== undefined).length !== layoutData.nodes.filter(n => n.clusterId !== undefined).length;

    if (hasNodesChanged || hasLinksChanged || hasClusterDataChanged) {
      console.log('  - Updating layout data with posts and statements');
      setLayoutData({ nodes: allNodes, links: allLinks });
    }
  }, [graph, clusters, layoutData.nodes, layoutData.links]);

  const value = {
    graph,
    layoutData,
    feed,
    analysis,
    clusters,
    loading: !graph || !analysis || !feed,
    error,
    addPendingReaction,
    removePendingReaction,
    onNextFeedArgument
  };

  return (
    <GraphContext.Provider value={value}>
      {children}
    </GraphContext.Provider>
  );
};
