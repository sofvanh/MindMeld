import { Socket } from 'socket.io';
import { addArgument } from '../db/operations/argumentOperations';
import { getGraphData } from '../db/operations/graphOperations';
import { updateGraphEdges } from '../db/operations/edgeOperations';
import { embedText, generateTopKSimilarEdges } from '../embeddingHandler';

export const handleAddArgument = async (
  socket: Socket,
  io: any,
  { graphId, statement }: { graphId: string; statement: string },
  callback?: Function
) => {
  if (!socket.data.user) {
    callback?.({ success: false, error: 'Authentication required' });
    return;
  }

  try {
    const graph = await getGraphData(graphId, socket.data.user.id);
    if (!graph) {
      callback?.({ success: false, error: 'Graph not found' });
      return;
    }

    const embedding = (await embedText([statement]))[0];
    const id = await addArgument(graphId, statement, embedding, socket.data.user.id);
    const newArgument = { id, graphId, statement, embedding, authorId: socket.data.user.id };

    graph.arguments.push(newArgument);
    const newEdges = generateTopKSimilarEdges(graph);
    await updateGraphEdges(graphId, newEdges);

    const updatedGraph = await getGraphData(graphId, socket.data.user.id);
    io.to(graphId).emit('graph update', updatedGraph);
    callback?.({ success: true, argument: newArgument });
  } catch (error) {
    console.error('Error adding argument:', error);
    callback?.({ success: false, error: 'Failed to add argument' });
  }
};