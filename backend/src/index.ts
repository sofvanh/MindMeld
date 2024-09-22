import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';


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

let graphData: { nodes: any[], links: any[] };

if (environment === 'development') {
  const testDataPath = path.join(__dirname, '../testdata.json');
  const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));
  graphData = testData;
  recalculateLinks();
  console.log('Loaded test data for development');
} else {
  graphData = {
    nodes: [
      {
        "id": "0",
        "name": "Climate change is a serious threat"
      },
      {
        "id": "1",
        "name": "Renewable energy can mitigate climate change"
      },
      {
        "id": "2",
        "name": "Economic growth is necessary for progress"
      },
      {
        "id": "3",
        "name": "Environmental regulations hinder economic growth"
      },
      {
        "id": "4",
        "name": "Technology can solve environmental problems"
      }
    ],
    links: [
      { source: "0", target: "1" },
      { source: "1", target: "4" },
      { source: "2", target: "3" },
      { source: "3", target: "4" },
      { source: "0", target: "2" }
    ]
  };
  console.log('Initialized test graph for production');
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
  console.log('A user connected, socket ID:', socket.id);

  socket.on('get graph data', () => {
    console.log('Sending initial graph data to socket:', socket.id);
    socket.emit('initial graph data', graphData);
  });

  socket.on('add argument', (text: string) => {
    console.log('Received new argument from socket', socket.id, ':', text);
    const newNode = {
      id: String(graphData.nodes.length),
      name: text,
      val: 1,
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