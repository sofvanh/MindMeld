import { Socket } from 'socket.io';
import { addArgument } from '../db/operations/argumentOperations';
import { getGraphDataWithUserReactions } from '../db/operations/graphOperations';
import { updateGraphEdges } from '../db/operations/edgeOperations';
import { embedText, generateTopKSimilarEdges } from '../embeddingHandler';
import { sendNewArgumentUpdate } from './updateHandler';

export const handleAddArgument = async (
  socket: Socket,
  io: any,
  { graphId, statement }: { graphId: string; statement: string },
  callback?: Function
) => {
  if (!socket.data.user) {
    console.log(`Failed to add argument: No user data on socket. Graph ID: ${graphId}, Statement: ${statement}, Socket ID: ${socket.id}`);
    callback?.({ success: false, error: 'Authentication required' });
    return;
  }

  try {
    const graph = await getGraphDataWithUserReactions(graphId, socket.data.user.id);
    if (!graph) {
      console.log(`Failed to add argument: Graph not found. Graph ID: ${graphId}, Statement: ${statement}, User ID: ${socket.data.user.id}, Socket ID: ${socket.id}`);
      callback?.({ success: false, error: 'Graph not found' });
      return;
    }

    const embedding = (await embedText([statement]))[0];
    const id = await addArgument(graphId, statement, embedding, socket.data.user.id);
    const newArgument = { id, graphId, statement, embedding, authorId: socket.data.user.id };

    graph.arguments.push(newArgument);
    const newEdges = generateTopKSimilarEdges(graph);
    await updateGraphEdges(graphId, newEdges);

    sendNewArgumentUpdate(io, graphId, newArgument, newEdges);
    // TODO Make author 'agree' with their own argument
    callback?.({ success: true, argument: newArgument });
  } catch (error) {
    console.error('Error adding argument:', error);
    callback?.({ success: false, error: 'Failed to add argument' });
  }
};