import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import config from './config';
import { handleAuthenticate } from './websocket/auth/authenticate';
import { handleLogout } from './websocket/auth/logout';
import { handleJoinGraph, handleLeaveGraph } from './websocket/graphHandler';
import { handleAddArgument } from './websocket/argumentHandler';
import { handleAddReaction, handleRemoveReaction } from './websocket/reactionHandler';
import { SocketHandler, SocketResponse } from './backendTypes';
import { handleGetGraphs } from './websocket/graph/getGraphs';
import { handleCreateGraph } from './websocket/graph/createGraph';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.frontendUrl,
    methods: ["GET", "POST"]
  }
});

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the MindMeld backend!' });
});

io.on('connection', (socket) => {
  console.log('A user connected, socket ID:', socket.id);

  const wrapHandler = <TData, TResponse>(handler: SocketHandler<TData, TResponse>) => {
    return (data: TData, callback: (response: SocketResponse<TResponse>) => void) => {
      if (typeof callback !== 'function') {
        console.error('No callback provided for socket event');
        return;
      }

      handler(socket, io, data)
        .then(response => callback(response))
        .catch(error => {
          console.error('Socket handler error:', error);
          const errorMessage =
            error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT'
              ? 'Database connection issue (server) - please ensure IP is whitelisted'
              : error.code === 'EADDRNOTAVAIL' || error.code === 'ENETUNREACH'
                ? 'Network connection issue (server) - please check internet connection'
                : 'Operation failed - please try again'
          callback({
            success: false,
            error: errorMessage
          })
        })
    }
  }

  socket.on('authenticate', wrapHandler(handleAuthenticate));
  socket.on('logout', wrapHandler(handleLogout));
  socket.on('get graphs', wrapHandler(handleGetGraphs));
  socket.on('create graph', wrapHandler(handleCreateGraph));
  // TODO Finish transition
  socket.on('join graph', (graphId: string) => handleJoinGraph(socket, graphId));
  socket.on('leave graph', (graphId: string) => handleLeaveGraph(socket, graphId));
  socket.on('add argument', (args, callback) => handleAddArgument(socket, io, args, callback));
  socket.on('add reaction', (args, callback) => handleAddReaction(socket, io, args, callback));
  socket.on('remove reaction', (args, callback) => handleRemoveReaction(socket, io, args, callback));
  socket.on('disconnect', () => console.log(`User disconnected: ${socket.id}`));
  socket.on('reconnect', () => console.log(`User reconnected: ${socket.id}`));
});

server.listen(config.port, () => {
  console.log(`Server running at ${config.backendUrl}:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Allowing CORS for origin: ${config.frontendUrl}`);
});