import Layout from './components/Layout';
import ArgumentMap from './components/ArgumentMap';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './components/Home';
import GraphList from './components/GraphList';
import { WebSocketProvider } from './contexts/WebSocketContext';

function App() {
  return (
    <WebSocketProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/graph/:graphId" element={<ArgumentMap />} />
            <Route path="/graphs" element={<GraphList />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </WebSocketProvider>
  );
}

export default App;