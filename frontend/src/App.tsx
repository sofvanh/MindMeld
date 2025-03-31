import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { AuthProvider } from './contexts/AuthContext';
import GraphLayout from './components/graph/GraphLayout';
import LoginView from './views/LoginView';

// Lazy load components
const HomeView = lazy(() => import('./views/HomeView'));
const GraphView = lazy(() => import('./views/GraphView'));
const FeedView = lazy(() => import('./views/FeedView').then(module => ({ default: module.FeedView })));
const GraphListView = lazy(() => import('./views/GraphListView'));
const DesignSystemView = lazy(() => import('./views/DesignSystemView'));
const ScoresView = lazy(() => import('./views/ScoresView'));
const GettingStartedView = lazy(() => import('./views/docs/GettingStartedView'));
const TechnicalDetailsView = lazy(() => import('./views/docs/TechnicalDetailsView'));
const PhilosophyView = lazy(() => import('./views/docs/PhilosophyView'));
const AnalysisView = lazy(() => import('./views/AnalysisView').then(module => ({ default: module.AnalysisView })));

// Loading fallback
const LoadingFallback = () => <div className="loading-spinner">Loading...</div>;

function App() {
  return (
    <WebSocketProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
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
          </Suspense>
        </Router>
      </AuthProvider>
    </WebSocketProvider>
  );
}

export default App;
