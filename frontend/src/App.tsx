import Layout from './components/Layout';
import ArgumentMap from './components/ArgumentMap';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './components/Home';
import GraphList from './components/GraphList';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { AuthProvider } from './contexts/AuthContext';


function App() {
  return (
    <WebSocketProvider>
      <AuthProvider>
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
      </AuthProvider>
    </WebSocketProvider>
  );
}

export default App;