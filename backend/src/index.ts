import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';

import { embedText, cosineSimilarity } from './embeddingHandler';

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

let graphData: { nodes: any[], links: any[] } = {
  nodes: [],
  links: []
};

if (environment === 'development') {
  const testDataPath = path.join(__dirname, '../testdata.json');
  const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));

  // Add embedding to each node in testData
  (async () => {
    const nodeNames = testData.nodes.map((node: { name: string }) => node.name);
    const embeddings = await embedText(nodeNames);
    testData.nodes.forEach((node: { embedding: number[] }, index: number) => {
      node.embedding = embeddings[index];
    });
    graphData = testData;
    recalculateLinks();
    console.log('Loaded test data for development');
    io.emit('graph update', graphData);
  })();
} else {
  graphData = {
    nodes: [],
    links: []
  };
  console.log('Initialized empty graph for production');
}

// K-nearest neighbors algorithm
function recalculateLinks(k = 3) {
  const nodeCount = graphData.nodes.length;
  const newLinks: { source: string, target: string }[] = [];

  for (let i = 0; i < nodeCount; i++) {
    const sourceNode = graphData.nodes[i];
    const similarities = graphData.nodes.map((targetNode, index) => {
      if (index === i) { // Skip self
        return { index, similarity: -1 };
      }
      return {
        index,
        similarity: cosineSimilarity(sourceNode.embedding, targetNode.embedding)
      };
    });

    const nearestNeighbors = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);

    nearestNeighbors.forEach(neighbor => {
      newLinks.push({ source: i.toString(), target: neighbor.index.toString() });
    });
  }

  graphData.links = newLinks;
}

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the MindMeld backend!' });
});

io.on('connection', (socket) => {
  console.log('A user connected, socket ID:', socket.id);

  socket.on('get graph data', () => {
    console.log('Sending initial graph data to socket:', socket.id);
    socket.emit('initial graph data', graphData);
  });

  socket.on('add argument', async (text: string) => {
    console.log('Received new argument from socket', socket.id, ':', text);
    const newNode = {
      id: String(graphData.nodes.length),
      name: text,
      val: 1,
      embedding: (await embedText([text]))[0]
    };
    graphData.nodes.push(newNode);
    recalculateLinks();
    console.log('Updated graph data, emitting to all clients');
    io.emit('graph update', graphData);
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