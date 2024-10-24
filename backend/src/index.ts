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

let graphsList: { id: string; name: string }[] = [];
let graphs: { [key: string]: Graph } = {};

async function initializeGraphs() {
  graphsList = await getGraphs();
  for (const { id } of graphsList) {
    try {
      const graphData = await getGraphData(id);
      graphs[id] = graphData;
    } catch (error) {
      console.error(`Error loading graph ${id}:`, error);
    }
  }
}

initializeGraphs().catch(error => {
  console.error('Error initializing graphs:', error);
  console.log('Config:', config);
});

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
      graphsList.push(newGraph);
      graphs[graphId] = { id: graphId, name, arguments: [], edges: [] };

      callback?.({ success: true, graph: newGraph });
      io.emit('graphs list', graphsList);
    } catch (error) {
      console.error('Error creating graph:', error);
      callback?.({ success: false, error: 'Failed to create graph' });
    }
  });

  socket.on('join graph', (graphId: string) => {
    console.log(`Socket ${socket.id} joining graph ${graphId}`);
    socket.join(graphId);
    socket.emit('graph data', graphs[graphId]);
  });

  socket.on('add argument', async ({ graphId, statement }: { graphId: string, statement: string }, callback?: Function) => {
    if (!socket.data.user) {
      callback?.({ success: false, error: 'Authentication required' });
      return;
    }

    if (!graphs[graphId]) {
      callback?.({ success: false, error: 'Graph not found' });
      return;
    }

    try {
      const graph = graphs[graphId];
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
      graph.edges = newEdges;
      graphs[graphId] = graph;

      io.to(graphId).emit('graph update', graphs[graphId]);
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

  socket.on('get graphs', () => socket.emit('graphs list', graphsList));
  socket.on('disconnect', () => console.log(`User disconnected: ${socket.id}`));
});

server.listen(config.port, () => {
  console.log(`Server running at ${config.backendUrl}:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Allowing CORS for origin: ${config.frontendUrl}`);
});