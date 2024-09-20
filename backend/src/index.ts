import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3001;

let graphData: { nodes: any[], links: any[] };

if (process.env.NODE_ENV === 'development') {
  const testDataPath = path.join(__dirname, '../testdata.json');
  const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));
  graphData = testData;
  recalculateLinks();
  console.log('Loaded test data for development');
} else {
  graphData = {
    nodes: [],
    links: []
  };
  console.log('Initialized empty graph data for production');
}

// Placeholder - assigns random links to nodes
function recalculateLinks() {
  const nodeCount = graphData.nodes.length;
  const newLinks = [];

  for (let i = 0; i < nodeCount + 1; i++) {
    const source = Math.floor(Math.random() * nodeCount).toString();
    let target = Math.floor(Math.random() * nodeCount).toString();

    // Ensure source and target are different
    while (target === source) {
      target = Math.floor(Math.random() * nodeCount).toString();
    }

    newLinks.push({ source, target });
  }

  graphData.links = newLinks;
}

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the MindMeld backend!' });
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('get graph data', () => {
    socket.emit('initial graph data', graphData);
  });

  socket.on('add argument', (text: string) => {
    const newNode = {
      id: String(graphData.nodes.length),
      name: text,
      val: 1,
    };
    graphData.nodes.push(newNode);
    recalculateLinks();
    io.emit('graph update', graphData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});