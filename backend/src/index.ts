import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import config from './config';
import { handleAuthenticate } from './websocket/auth/authenticate';
import { handleLogout } from './websocket/auth/logout';
import { SocketHandler, SocketResponse } from './backendTypes';
import { handleGetGraphs } from './websocket/graph/getGraphs';
import { handleGetFeaturedGraphs } from './websocket/graph/getFeaturedGraphs';
import { handleCreateGraph } from './websocket/graph/createGraph';
import { handleJoinGraph } from './websocket/graph/joinGraph';
import { handleLeaveGraph } from './websocket/graph/leaveGraph';
import { handleGetMyGraphs } from './websocket/graph/getMyGraphs';
import batchManager from './websocket/batchProcessing/batchManager';
import { handleGetFeed } from './websocket/feed/getFeed';
import { memoryCache } from './services/cacheService';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.frontendUrls,
    methods: ["GET", "POST"]
  }
});

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the MindMeld backend!' });
});

app.get('/api/cache-stats', (req, res) => {
  res.json({
    ...memoryCache.getStats(),
    environment: config.nodeEnv
  });
});

if (config.nodeEnv === 'development') {
  app.post('/api/cache-clear', (req, res) => {
    memoryCache.clear();
    res.json({
      success: true,
      message: 'Cache cleared successfully',
      stats: memoryCache.getStats()
    });
  });
} else {
  console.log('Current environment:', config.nodeEnv);
}

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
  socket.on('get featured graphs', wrapHandler(handleGetFeaturedGraphs));
  socket.on('get my graphs', wrapHandler(handleGetMyGraphs));
  socket.on('get feed', wrapHandler(handleGetFeed));
  socket.on('create graph', wrapHandler(handleCreateGraph));
  socket.on('join graph', wrapHandler(handleJoinGraph));
  socket.on('leave graph', wrapHandler(handleLeaveGraph));
  socket.on('add argument', (data, callback) => {
    batchManager.addAction({
      type: 'add argument',
      socket,
      io,
      data,
      callback
    })
  });
  socket.on('add reaction', (data, callback) => {
    batchManager.addAction({
      type: 'add reaction',
      socket,
      io,
      data,
      callback
    })
  });
  socket.on('remove reaction', (data, callback) => {
    batchManager.addAction({
      type: 'remove reaction',
      socket,
      io,
      data,
      callback
    })
  });
  socket.on('disconnect', () => console.log(`User disconnected: ${socket.id}`));
  socket.on('reconnect', () => console.log(`User reconnected: ${socket.id}`));
});

server.listen(config.port, () => {
  console.log(`Server running at ${config.backendUrl}:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Allowing CORS for origins: ${config.frontendUrls.join(', ')}`);
});
