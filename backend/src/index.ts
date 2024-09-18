import express from 'express';

const app = express();
const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the MindMeld backend!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});