import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3001;

// In-memory storage for graph data
let graphData = {
  nodes: [
    { id: '0', name: 'Rain is useful', val: 1 },
    { id: '1', name: 'Rain reduces quality of life', val: 1 },
    { id: '2', name: 'Wildfires are not good for the world', val: 1 },
  ],
  links: [
    { source: '0', target: '1' },
    { source: '0', target: '2' },
  ],
};

// Function to recalculate links
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

    // Recalculate links after adding a new node
    recalculateLinks();

    io.emit('graph update', graphData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});