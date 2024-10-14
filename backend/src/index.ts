import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { embedText, generateTopKSimilarEdges } from './embeddingHandler';
import { Graph, Argument } from './.shared/types';
import { createGraph, getGraphs, getGraphData, addArgument, updateGraphEdges } from './db/dbOperations';
import config from './config';


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.frontendUrl,
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

initializeGraphs().catch(error => {
  console.error('Error initializing graphs:', error);
  console.log('Config:', config);
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the MindMeld backend!' });
});

io.on('connection', (socket) => {
  console.log('A user connected, socket ID:', socket.id);

  socket.on('create graph', async (name: string) => {
    console.log('Creating graph');
    try {
      const graphId = await createGraph(name);
      console.log(`New graph added to database with ID: ${graphId}`);

      const newGraph = { id: graphId, name };
      graphsList.push(newGraph);
      graphs[graphId] = { id: graphId, name, arguments: [], edges: [] };
      console.log(`New graph added to in-memory list: ${JSON.stringify(newGraph)}`);

      socket.emit('graph created', newGraph);
      io.emit('graphs list', graphsList);
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
    console.log('Added new argument', id)
    const newEdges = generateTopKSimilarEdges(graph);
    await updateGraphEdges(graphId, newEdges);
    graph.edges = newEdges;
    graphs[graphId] = graph;
    console.log('Updated graph edges. Emitting to all clients in the graph');
    io.to(graphId).emit('graph update', graphs[graphId]);
  });

  socket.on('get graphs', () => socket.emit('graphs list', graphsList));
  socket.on('disconnect', () => console.log(`User disconnected: ${socket.id}`));
});

server.listen(config.port, () => {
  console.log(`Server running at ${config.backendUrl}:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Allowing CORS for origin: ${config.frontendUrl}`);
});