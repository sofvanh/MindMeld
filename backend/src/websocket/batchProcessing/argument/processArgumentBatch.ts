
import _ from 'lodash';
import { BatchableAction } from '../batchableAction';
import { getGraphs } from '../../../db/operations/graphOperations';
import { embedText, generateTopKSimilarEdges } from '../../../embeddingHandler';
import { addArguments, getArguments } from '../../../db/operations/argumentOperations';
import { updateGraphEdges } from '../../../db/operations/edgeOperations';
import { sendNewArgumentsUpdate } from '../../updateHandler';
import { Server } from 'socket.io';
import { DbArgument, DbEdge } from '../../../db/dbTypes';
import { Argument, Edge } from '../../../.shared/types';


export async function processArgumentBatch(
  actions: Array<BatchableAction & { type: 'add argument' }>
) {
  console.log("In processArgumentBatch")
  console.time("processArgumentBatch")

  const statements = actions.map(action => action.data.statement);
  const embeddings = await embedText(statements);
  const newArguments: {
    graphId: string;
    statement: string;
    embedding: number[];
    authorId: string;
  }[] = actions.map((action, i) => ({
    graphId: action.data.graphId,
    statement: action.data.statement,
    embedding: embeddings[i],
    authorId: action.socket.data.user.id
  }));

  console.log("Adding arguments")

  const newArgumentObjects = await addArguments(newArguments);
  const graphIds = [...new Set(actions.map(action => action.data.graphId))];

  const [graphs, args] = await Promise.all([
    getGraphs(graphIds),
    getArguments(graphIds)
  ]);

  const allNewEdges: { graphId: string, edges: { sourceId: string, targetId: string }[] }[] = []

  for (const graph of graphs) {
    const graphArgs = args.filter(arg => arg.graph_id == graph.id);
    const nodes: { id: string, embedding: number[] }[] = graphArgs.map(arg => ({ id: arg.id, embedding: arg.embedding }));
    const newEdges = generateTopKSimilarEdges(nodes);
    allNewEdges.push({ graphId: graph.id, edges: newEdges })
  }

  const newEdgeObjects = (await Promise.all(allNewEdges.map(({ graphId, edges }) => updateGraphEdges(graphId, edges)))).flat();

  await emitUpdates(actions[0].io, graphIds, newArgumentObjects, newEdgeObjects);
  console.timeEnd("processArgumentBatch")
}

async function emitUpdates(io: Server, graphIds: string[], args: DbArgument[], edges: DbEdge[]) {
  const argumentsByGraph = _.groupBy(args, 'graph_id');
  const edgesByGraph = _.groupBy(edges, 'graph_id');
  for (const graphId of graphIds) {
    const graphArguments = argumentsByGraph[graphId] || [];
    const graphEdges = edgesByGraph[graphId] || [];

    const args: Argument[] = graphArguments.map(argData => ({
      id: argData.id,
      graphId: argData.graph_id,
      statement: argData.statement,
      embedding: argData.embedding,
      authorId: argData.author_id
    }));

    const edges: Edge[] = graphEdges.map(edge => ({
      id: edge.id,
      graphId: edge.graph_id,
      sourceId: edge.source_id,
      targetId: edge.target_id
    }));

    await sendNewArgumentsUpdate(io, graphId, args, edges);
  }
}