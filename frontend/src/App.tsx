import Layout from './components/Layout';
import GraphView from './views/GraphView';
import { FeedView } from './views/FeedView';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomeView from './views/HomeView';
import GraphListView from './views/GraphListView';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { AuthProvider } from './contexts/AuthContext';
import DesignSystemView from './views/DesignSystemView';
import ScoresView from './views/ScoresView';
import GraphLayout from './components/graph/GraphLayout';


function App() {
  return (
    <WebSocketProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/graph/:graphId" element={
                <GraphLayout>
                  <GraphView />
                </GraphLayout>
              } />
              <Route path="/feed/:graphId" element={
                <GraphLayout>
                  <FeedView />
                </GraphLayout>
              } />
              <Route path="/graphs" element={<GraphListView />} />
              <Route path="/design" element={<DesignSystemView />} />
              <Route path="/scores" element={<ScoresView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </WebSocketProvider>
  );
}

export default App;
