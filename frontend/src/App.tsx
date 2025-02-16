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
          <Routes>
            <Route path="/" element={
              <Layout>
                <HomeView />
              </Layout>
            } />
            <Route path="/graph/:graphId" element={
              <Layout hideFooter>
                <GraphLayout>
                  <GraphView />
                </GraphLayout>
              </Layout>
            } />
            <Route path="/feed/:graphId" element={
              <Layout hideFooter>
                <GraphLayout>
                  <FeedView />
                </GraphLayout>
              </Layout>
            } />
            <Route path="/graphs" element={
              <Layout>
                <GraphListView />
              </Layout>
            } />
            <Route path="/design" element={
              <Layout>
                <DesignSystemView />
              </Layout>
            } />
            <Route path="/scores" element={
              <Layout>
                <ScoresView />
              </Layout>
            } />
            <Route path="*" element={
              <Layout>
                <Navigate to="/" replace />
              </Layout>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </WebSocketProvider>
  );
}

export default App;
