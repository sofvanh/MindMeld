import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { AuthProvider } from './contexts/AuthContext';
import GraphLayout from './components/graph/GraphLayout';
import LoginView from './views/LoginView';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load components
const HomeView = lazy(() => import('./views/HomeView'));
const GraphView = lazy(() => import('./views/GraphView'));
const FeedView = lazy(() => import('./views/FeedView').then(module => ({ default: module.FeedView })));
const DesignSystemView = lazy(() => import('./views/DesignSystemView'));
const ScoresView = lazy(() => import('./views/ScoresView'));
const GettingStartedView = lazy(() => import('./views/docs/GettingStartedView'));
const TechnicalDetailsView = lazy(() => import('./views/docs/TechnicalDetailsView'));
const PhilosophyView = lazy(() => import('./views/docs/PhilosophyView'));
const AnalysisView = lazy(() => import('./views/AnalysisView').then(module => ({ default: module.AnalysisView })));
const AdminView = lazy(() => import('./views/AdminView'));


const LoadingFallback = () => (
  <div className="flex-grow flex items-center justify-center h-full">
    <LoadingSpinner />
  </div>
);

const LazyView = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingFallback />}>
    {children}
  </Suspense>
);

function App() {
  return (
    <WebSocketProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              <Layout hideHeader hideFooter>
                <LazyView>
                  <HomeView />
                </LazyView>
              </Layout>
            } />
            <Route path="/login" element={<LoginView />} />
            <Route path="/docs/getting-started" element={
              <LazyView>
                <GettingStartedView />
              </LazyView>
            } />
            <Route path="/docs" element={<Navigate to="/docs/getting-started" replace />} />
            <Route path="/docs/technical-details" element={
              <LazyView>
                <TechnicalDetailsView />
              </LazyView>
            } />
            <Route path="/docs/philosophy" element={
              <LazyView>
                <PhilosophyView />
              </LazyView>
            } />
            <Route path="/graph/:graphId" element={
              <Layout hideFooter hideHeader>
                <GraphLayout>
                  <LazyView>
                    <GraphView />
                  </LazyView>
                </GraphLayout>
              </Layout>
            } />
            <Route path="/feed/:graphId" element={
              <Layout hideFooter hideHeader>
                <GraphLayout>
                  <LazyView>
                    <FeedView />
                  </LazyView>
                </GraphLayout>
              </Layout>
            } />
            <Route path="/analysis/:graphId" element={
              <Layout hideFooter hideHeader>
                <GraphLayout>
                  <LazyView>
                    <AnalysisView />
                  </LazyView>
                </GraphLayout>
              </Layout>
            } />
            <Route path="/admin" element={
              <Layout>
                <LazyView>
                  <AdminView />
                </LazyView>
              </Layout>
            } />
            <Route path="/design" element={
              <Layout>
                <LazyView>
                  <DesignSystemView />
                </LazyView>
              </Layout>
            } />
            <Route path="/scores" element={
              <Layout>
                <LazyView>
                  <ScoresView />
                </LazyView>
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
