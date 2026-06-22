// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import { LoadingSpinner } from './components/common/index.jsx';

// Route-level lazy loading (handbook §3.5): each page chunk is downloaded only
// when the user navigates to that route, not upfront. The Suspense fallback
// shows while the chunk loads.
const LoginPage           = lazy(() => import('./pages/LoginPage'));
const RegisterPage        = lazy(() => import('./pages/RegisterPage'));
const TicketListPage      = lazy(() => import('./pages/TicketListPage'));
const CreateTicketPage    = lazy(() => import('./pages/CreateTicketPage'));
const TicketDetailPage    = lazy(() => import('./pages/TicketDetailPage'));
const StaffDashboardPage  = lazy(() => import('./pages/StaffDashboardPage'));
const TeamDashboardPage   = lazy(() => import('./pages/TeamDashboardPage'));
const ProductAnalysisPage = lazy(() => import('./pages/ProductAnalysisPage'));
const ProductsPage        = lazy(() => import('./pages/ProductsPage'));
const TeamsPage           = lazy(() => import('./pages/TeamsPage'));
const UsersPage           = lazy(() => import('./pages/UsersPage'));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Navbar />
          <main className="app-main">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
              {/* Public */}
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Any authenticated role */}
              <Route path="/" element={<Navigate to="/tickets" replace />} />
              <Route path="/tickets" element={
                <ProtectedRoute><TicketListPage /></ProtectedRoute>
              } />

              {/* Customer only — must be declared BEFORE /tickets/:id so the
                  static segment "new" is matched before the dynamic :id param */}
              <Route path="/tickets/new" element={
                <ProtectedRoute roles={['customer']}>
                  <CreateTicketPage />
                </ProtectedRoute>
              } />

              <Route path="/tickets/:id" element={
                <ProtectedRoute><TicketDetailPage /></ProtectedRoute>
              } />

              {/* Staff + upward: own dashboard */}
              <Route path="/dashboard/staff/:id" element={
                <ProtectedRoute roles={['staff', 'manager', 'admin']}>
                  <StaffDashboardPage />
                </ProtectedRoute>
              } />

              {/* Manager + admin */}
              <Route path="/dashboard/team/:id" element={
                <ProtectedRoute roles={['manager', 'admin']}>
                  <TeamDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/products" element={
                <ProtectedRoute roles={['manager', 'admin']}>
                  <ProductAnalysisPage />
                </ProtectedRoute>
              } />

              {/* Admin only */}
              <Route path="/products" element={
                <ProtectedRoute roles={['admin']}>
                  <ProductsPage />
                </ProtectedRoute>
              } />
              <Route path="/teams" element={
                <ProtectedRoute roles={['admin']}>
                  <TeamsPage />
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute roles={['admin']}>
                  <UsersPage />
                </ProtectedRoute>
              } />

              {/* Catch-all */}
              <Route path="*" element={
                <div className="empty-state">
                  <h2>404 — Page not found</h2>
                  <a href="/">← Back to tickets</a>
                </div>
              } />
            </Routes>
            </Suspense>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
