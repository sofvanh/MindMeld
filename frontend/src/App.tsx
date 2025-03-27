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
import GettingStartedView from './views/docs/GettingStartedView';
import TechnicalDetailsView from './views/docs/TechnicalDetailsView';
import PhilosophyView from './views/docs/PhilosophyView';
import LoginView from './views/LoginView';
import { AnalysisView } from './views/AnalysisView';

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
            <Route path="/login" element={<LoginView />} />
            <Route path="/docs/getting-started" element={<GettingStartedView />} />
            <Route path="/docs" element={<Navigate to="/docs/getting-started" replace />} />
            <Route path="/docs/technical-details" element={<TechnicalDetailsView />} />
            <Route path="/docs/philosophy" element={<PhilosophyView />} />
            {/* TODO We could merge the two routes below, letting GraphLayout decide which view to show */}
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
            <Route path="/analysis/:graphId" element={
              <Layout hideFooter>
                <GraphLayout>
                  <AnalysisView />
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
