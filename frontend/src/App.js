import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import Customer from './pages/Customer';
import Aircraft from './pages/Aircraft';
import AdminDashboard from './pages/AdminDashboard';
import AddCustomer from './pages/AddCustomer';
import AddAircraft from './pages/AddAircraft';
import AddManualApp from './pages/AddManualApp';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/customer/:id"
                element={
                  <ProtectedRoute>
                    <Customer />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/customer/:customerId/aircraft/:aircraftId"
                element={
                  <ProtectedRoute>
                    <Aircraft />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/customer/add"
                element={
                  <ProtectedRoute adminOnly>
                    <AddCustomer />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/aircraft/add"
                element={
                  <ProtectedRoute adminOnly>
                    <AddAircraft />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/manual-app/add"
                element={
                  <ProtectedRoute adminOnly>
                    <AddManualApp />
                  </ProtectedRoute>
                }
              />

              {/* 404 Redirect */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
