import { SocketHandler } from "../../backendTypes";
import { Socket } from "socket.io";

export const handleLogout: SocketHandler<void, void> = async (socket: Socket) => {
  socket.data.user = null;
  return {
    success: true
  }
};