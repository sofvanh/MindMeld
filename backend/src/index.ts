import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { embedText, generateTopKSimilarEdges } from './embeddingHandler';
import { Graph, Argument } from './.shared/types';
import { generateArgumentId } from './db/idGenerator';
import { createGraph, getGraphs, getGraphData } from './db/dbOperations';

const backendUrl = process.env.BACKEND_URL || 'http://localhost';
const port = process.env.PORT || 3001;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const environment = process.env.NODE_ENV || 'development';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: frontendUrl,
    methods: ["GET", "POST"]
  }
});

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

initializeGraphs().catch(error => console.error('Error initializing graphs:', error));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the MindMeld backend!' });
});

io.on('connection', (socket) => {
  console.log('A user connected, socket ID:', socket.id);

  socket.on('create graph', async (name: string) => {
    console.log('Creating graph');
    try {
      const graphId = await createGraph(name);
      console.log(`New graph created with ID: ${graphId}`);
      socket.emit('graph created', { id: graphId, name });
    } catch (error) {
      console.error('Error creating graph:', error);
      socket.emit('graph creation error', { message: 'Failed to create graph' });
    }
  });

  socket.on('join graph', (graphId: string) => {
    console.log(`Socket ${socket.id} joining graph ${graphId}`);
    socket.join(graphId);
    socket.emit('graph data', graphs[graphId]);
  });

  socket.on('add argument', async ({ graphId, statement }: { graphId: string, statement: string }) => {
    console.log('Received new argument for graph', graphId, 'from socket', socket.id, ':', statement);
    if (!graphs[graphId]) return;

    const id = generateArgumentId();
    const embedding = (await embedText([statement]))[0];
    const newArgument: Argument = {
      id,
      graphId,
      statement,
      embedding
    };
    graphs[graphId].arguments.push(newArgument);

    const newEdges = generateTopKSimilarEdges(graphs, graphId);
    graphs[graphId].edges = newEdges;

    console.log('Updated graph data, emitting to all clients in the graph');
    io.to(graphId).emit('graph update', graphs[graphId]);
    // TODO Push new argument and edge changes to db
  });

  socket.on('get graphs', () => socket.emit('graphs list', graphsList));
  socket.on('disconnect', () => console.log(`User disconnected: ${socket.id}`));
});

server.listen(port, () => {
  console.log(`Server running at ${backendUrl}:${port}`);
  console.log(`Environment: ${environment}`);
  console.log(`Allowing CORS for origin: ${frontendUrl}`);
});