import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { embedText, generateTopKSimilarEdges } from './embeddingHandler';
import { Graph, Argument, User } from './.shared/types';
import { findOrCreateUser, createGraph, getGraphs, getGraphData, addArgument, updateGraphEdges } from './db/dbOperations';
import config from './config';
import { OAuth2Client } from 'google-auth-library';


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.frontendUrl,
    methods: ["GET", "POST"]
  }
});

const googleAuthClient = new OAuth2Client(config.googleClientId);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the MindMeld backend!' });
});

async function verifyToken(token: string): Promise<User | null> {
  try {
    const ticket = await googleAuthClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload['sub'] || !payload['email']) {
      return null;
    }

    return await findOrCreateUser(payload['sub'], payload['email']);
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

io.on('connection', (socket) => {
  console.log('A user connected, socket ID:', socket.id);

  socket.on('authenticate', async (token: string, callback?: Function) => {
    const user = await verifyToken(token);
    if (user) {
      socket.data.user = user;
      callback?.({ success: true, user });
    } else {
      callback?.({ success: false, error: 'Authentication failed' });
    }
  });

  socket.on('create graph', async (name: string, callback?: Function) => {
    if (!socket.data.user) {
      callback?.({ success: false, error: 'Authentication required' });
      return;
    }

    try {
      const graphId = await createGraph(name);
      const newGraph = { id: graphId, name };
      callback?.({ success: true, graph: newGraph });
    } catch (error) {
      console.error('Error creating graph:', error);
      callback?.({ success: false, error: 'Failed to create graph' });
    }
  });

  socket.on('join graph', async (graphId: string) => {
    console.log(`Socket ${socket.id} joining graph ${graphId}`);
    socket.join(graphId);
    const graphData = await getGraphData(graphId);
    socket.emit('graph data', graphData);
  });

  socket.on('add argument', async ({ graphId, statement }: { graphId: string, statement: string }, callback?: Function) => {
    if (!socket.data.user) {
      callback?.({ success: false, error: 'Authentication required' });
      return;
    }

    try {
      const graph = await getGraphData(graphId);
      if (!graph) {
        callback?.({ success: false, error: 'Graph not found' });
        return;
      }

      const embedding = (await embedText([statement]))[0];
      const id = await addArgument(graphId, statement, embedding);
      const newArgument: Argument = {
        id,
        graphId,
        statement,
        embedding
      };

      graph.arguments.push(newArgument);
      const newEdges = generateTopKSimilarEdges(graph);
      await updateGraphEdges(graphId, newEdges);

      const updatedGraph = await getGraphData(graphId);
      io.to(graphId).emit('graph update', updatedGraph);
      callback?.({ success: true, argument: newArgument });
    } catch (error) {
      console.error('Error adding argument:', error);
      callback?.({ success: false, error: 'Failed to add argument' });
    }
  });

  socket.on('logout', (callback?: Function) => {
    socket.data.user = null;
    callback?.();
  });

  socket.on('get graphs', async () => socket.emit('graphs list', await getGraphs()));
  socket.on('disconnect', () => console.log(`User disconnected: ${socket.id}`));
});

server.listen(config.port, () => {
  console.log(`Server running at ${config.backendUrl}:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Allowing CORS for origin: ${config.frontendUrl}`);
});