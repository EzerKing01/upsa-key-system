import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import KeyLogs from './pages/KeyLogs';
import CollectKey from './pages/CollectKey';
import ReturnKey from './pages/ReturnKey';
import ShiftHandover from './pages/ShiftHandover';
import DailyLogs from './pages/DailyLogs';
import AdminUsers from './pages/AdminUsers';
import Keys from './pages/Keys';
import KeyLogDetail from './pages/KeyLogDetail';
import ManageKeys from './pages/ManageKeys';
import { Toaster } from 'react-hot-toast';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/keys" element={<PrivateRoute><Keys /></PrivateRoute>} />
            <Route path="/keys/:id/logs" element={<PrivateRoute><KeyLogDetail /></PrivateRoute>} />
            <Route path="/key-logs" element={<PrivateRoute><KeyLogs /></PrivateRoute>} />
            <Route path="/collect" element={<PrivateRoute><CollectKey /></PrivateRoute>} />
            <Route path="/return" element={<PrivateRoute><ReturnKey /></PrivateRoute>} />
            <Route path="/shift-handover" element={<PrivateRoute><ShiftHandover /></PrivateRoute>} />
            <Route path="/daily-logs" element={<PrivateRoute><DailyLogs /></PrivateRoute>} />
            <Route path="/admin/users" element={<PrivateRoute requiredRole="admin"><AdminUsers /></PrivateRoute>} />
            <Route path="/admin/keys" element={<PrivateRoute requiredRole="admin"><ManageKeys /></PrivateRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;