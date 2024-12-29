import { Socket, Server } from "socket.io";


export type SocketHandler<TData = any, TResponse = any> = (
  socket: Socket,
  io: Server,
  data: TData
) => Promise<SocketResponse<TResponse>>;

export interface SocketResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}