import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

import { embedText } from './embeddingHandler';
import { Graph, Argument } from './.shared/types';
import { generateArgumentId } from './db/idGenerator';

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

const graphs: { [key: string]: Graph } = {};

// K-nearest neighbors algorithm
function recalculateLinks(graphId: string, k = 3) {
  // TODO
  // const graph = graphs[graphId];
  // if (!graph) return;

  // const nodeCount = graph.arguments.length;
  // const newLinks: Edge[] = [];

  // for (let i = 0; i < nodeCount; i++) {
  //   const sourceNode = graph.arguments[i];
  //   const similarities = graph.arguments.map((targetNode, index) => {
  //     if (index === i) return { index, similarity: -1 };
  //     return {
  //       index,
  //       similarity: cosineSimilarity(sourceNode.embedding, targetNode.embedding)
  //     };
  //   });

  //   const nearestNeighbors = similarities
  //     .sort((a, b) => b.similarity - a.similarity)
  //     .slice(0, k);

  //   nearestNeighbors.forEach(neighbor => {
  //     newLinks.push({ sourceId: sourceNode.id, target: graph.arguments[neighbor.index].id });
  //   });
  // }

  // graph.edges = newLinks;
}

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the MindMeld backend!' });
});

io.on('connection', (socket) => {
  console.log('A user connected, socket ID:', socket.id);

  // TODO Create graph

  socket.on('join graph', (graphId: string) => {
    console.log(`Socket ${socket.id} joining graph ${graphId}`);
    socket.join(graphId);
    // if (!graphs[graphId]) {
    //   graphs[graphId] = { id: graphId, name: `Graph ${graphId}`, arguments: [], edges: [] };
    // }
    socket.emit('initial graph data', graphs[graphId]);
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
    recalculateLinks(graphId);
    console.log('Updated graph data, emitting to all clients in the graph');
    io.to(graphId).emit('graph update', graphs[graphId]);
    // TODO Push to db
  });

  socket.on('disconnect', () => {
    console.log('User disconnected, socket ID:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server running at ${backendUrl}:${port}`);
  console.log(`Environment: ${environment}`);
  console.log(`Allowing CORS for origin: ${frontendUrl}`);
});