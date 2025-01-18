import { Socket, Server } from "socket.io";
import { SocketResponse } from "../../backendTypes";
import { AddArgumentData } from "../argument/addArgument";
import { AddReactionData } from "../reaction/addReaction";
import { RemoveReactionData } from "../reaction/removeReaction";

export type BatchableAction =
  | {
    type: 'add argument';
    socket: Socket;
    io: Server;
    data: AddArgumentData;
    callback: (response: SocketResponse<{}>) => void;
  }
  | {
    type: 'add reaction';
    socket: Socket;
    io: Server;
    data: AddReactionData;
    callback: (response: SocketResponse<{}>) => void;
  }
  | {
    type: 'remove reaction';
    socket: Socket;
    io: Server;
    data: RemoveReactionData;
    callback: (response: SocketResponse<{}>) => void;
  };