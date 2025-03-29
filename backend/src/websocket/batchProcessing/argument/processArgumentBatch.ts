import _ from 'lodash';
import { BatchableAction } from '../batchableAction';
import { getGraphsFromDb } from '../../../db/operations/graphOperations';
import { embedText, generateTopKSimilarEdges } from '../../../embeddingHandler';
import { addArguments, getArgumentsForGraphsFromDb } from '../../../db/operations/argumentOperations';
import { updateGraphEdges } from '../../../db/operations/edgeOperations';
import { sendNewArgumentsUpdate } from '../../updateHandler';
import { Server } from 'socket.io';
import { DbArgument, DbEdge } from '../../../db/dbTypes';
import { Argument, Edge } from '../../../.shared/types';
import { getArgumentScores } from '../../../analysis/argumentScoreHandler';

/**
 * Processes a batch of argument actions by efficiently handling database updates and generating embeddings.
 *
 * The function:
 * 1. Generates embeddings for all new argument statements
 * 2. Adds the new arguments to the database with their embeddings
 * 3. Retrieves all relevant graphs, arguments, and scores
 * 4. Generates new edges between arguments based on semantic similarity
 * 5. Updates the graph edges in the database
 * 6. Emits updates to connected clients with new arguments and edges
 */
export async function processArgumentBatch(
  actions: Array<BatchableAction & { type: 'add argument' }>
) {
  if (actions.length === 0) {
    console.log("No new arguments to process")
    return;
  }

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

  const [graphs, args, scores] = await Promise.all([
    getGraphsFromDb(graphIds),
    getArgumentsForGraphsFromDb(graphIds),
    Promise.all(graphIds.map(graphId => getArgumentScores(graphId)))
  ]);

  const argScores = new Map(scores.flatMap(scores =>
    Array.from(scores.entries())
  ));

  const allNewEdges: { graphId: string, edges: { sourceId: string, targetId: string }[] }[] = []

  for (const graph of graphs) {
    const graphArgs = args.filter(arg => arg.graph_id == graph.id);
    const nodes: { id: string, embedding: number[], clarity: number }[] = graphArgs.map(arg => ({
      id: arg.id,
      embedding: arg.embedding,
      clarity: argScores.get(arg.id)?.clarity ?? 1
    }));
    graphArgs.forEach(arg => {
      console.log(argScores.get(arg.id))
    })
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
