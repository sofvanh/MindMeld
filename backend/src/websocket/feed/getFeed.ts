import { Argument } from "../../.shared/types";
import { getArgumentPriorities } from "../../analysis/argumentPriorityHandler";
import { SocketHandler } from "../../backendTypes";
import { DbArgument } from "../../db/dbTypes";

interface getFeedData {
  graphId: string;
}

interface getFeedResponse {
  arguments: Argument[];
}

export const handleGetFeed: SocketHandler<getFeedData, getFeedResponse> = async (socket, io, { graphId }) => {
  console.time('getFeed');
  if (!socket.data.user) {
    return {
      success: false,
      error: 'Authentication required'
    }
  }

  const argumentPriorities: Map<DbArgument, number> = await getArgumentPriorities(graphId, socket.data.user.id);
  const argumentsForFeed = Array.from(argumentPriorities)
    .filter(([_, priority]) => priority > 0)
    .map(([argument]) => argument);

  const argumentObjects: Argument[] = argumentsForFeed.map(argument => ({
    id: argument.id,
    graphId: argument.graph_id,
    statement: argument.statement,
    embedding: argument.embedding,
    authorId: argument.author_id,
  }));

  console.timeEnd('getFeed');

  return {
    success: true,
    data: {
      arguments: argumentObjects
    }
  }
}
