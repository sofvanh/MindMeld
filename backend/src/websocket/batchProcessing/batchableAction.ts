import { Socket, Server } from "socket.io";
import { SocketResponse } from "../../backendTypes";

interface AddArgumentData {
  graphId: string;
  statement: string;
}

interface AddReactionData {
  graphId: string;
  argumentId: string;
  type: 'agree' | 'disagree' | 'unclear';
}

interface RemoveReactionData {
  graphId: string;
  argumentId: string;
  type: 'agree' | 'disagree' | 'unclear';
}

export type ReactionBatchableAction = {
  type: 'add reaction' | 'remove reaction';
  socket: Socket;
  io: Server;
  data: AddReactionData | RemoveReactionData;
  callback: (response: SocketResponse<{}>) => void;
};

export type BatchableAction =
  | {
    type: 'add argument';
    socket: Socket;
    io: Server;
    data: AddArgumentData;
    callback: (response: SocketResponse<{}>) => void;
  }
  | ReactionBatchableAction;