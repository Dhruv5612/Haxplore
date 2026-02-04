import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import FieldDashboard from './pages/FieldDashboard';
import StartDay from './pages/StartDay';
import EndDay from './pages/EndDay';
import AddMeeting from './pages/AddMeeting';
import AddSample from './pages/AddSample';
import AddSale from './pages/AddSale';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';
import './index.css';

// Protected route component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    console.log('ProtectedRoute: User is not admin (role:', user.role, '), redirecting to dashboard');
    return <Navigate to="/dashboard" />;
  }

  if (!adminOnly && user.role === 'admin') {
    console.log('ProtectedRoute: User is admin, redirecting to admin dashboard');
    return <Navigate to="/admin" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Field Officer Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <FieldDashboard />
            </ProtectedRoute>
          } />
          <Route path="/start-day" element={
            <ProtectedRoute>
              <StartDay />
            </ProtectedRoute>
          } />
          <Route path="/end-day" element={
            <ProtectedRoute>
              <EndDay />
            </ProtectedRoute>
          } />
          <Route path="/add-meeting" element={
            <ProtectedRoute>
              <AddMeeting />
            </ProtectedRoute>
          } />
          <Route path="/add-sample" element={
            <ProtectedRoute>
              <AddSample />
            </ProtectedRoute>
          } />
          <Route path="/add-sale" element={
            <ProtectedRoute>
              <AddSale />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute adminOnly>
              <Reports />
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
