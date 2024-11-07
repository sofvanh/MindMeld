import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import config from './config';
import { handleAuthenticate, handleLogout } from './websocket/authHandler';
import { handleCreateGraph, handleGetGraphs, handleJoinGraph, handleLeaveGraph } from './websocket/graphHandler';
import { handleAddArgument } from './websocket/argumentHandler';
import { handleAddReaction, handleRemoveReaction } from './websocket/reactionHandler';


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
  socket.on('authenticate', (token, callback) => handleAuthenticate(socket, token, callback));
  socket.on('logout', (callback) => handleLogout(socket, callback));
  socket.on('create graph', (name, callback) => handleCreateGraph(socket, name, callback));
  socket.on('join graph', (graphId: string) => handleJoinGraph(socket, graphId));
  socket.on('leave graph', (graphId: string) => handleLeaveGraph(socket, graphId)); // TODO Invoke this from client
  socket.on('get graphs', () => handleGetGraphs(socket));
  socket.on('add argument', (args, callback) => handleAddArgument(socket, io, args, callback));
  socket.on('add reaction', (args, callback) => handleAddReaction(socket, io, args, callback));
  socket.on('remove reaction', (args, callback) => handleRemoveReaction(socket, io, args, callback));
  socket.on('disconnect', () => console.log(`User disconnected: ${socket.id}`));
});

server.listen(config.port, () => {
  console.log(`Server running at ${config.backendUrl}:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Allowing CORS for origin: ${config.frontendUrl}`);
});