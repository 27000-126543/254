import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BoothManagement from './pages/BoothManagement';
import ProductManagement from './pages/ProductManagement';
import ExhibitorRecommendations from './pages/ExhibitorRecommendations';
import HeatMap from './pages/HeatMap';
import ETicket from './pages/ETicket';
import ConferenceManagement from './pages/ConferenceManagement';
import FoodService from './pages/FoodService';
import MemberCenter from './pages/MemberCenter';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { currentUser } = useApp();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* 参展商路由 */}
      <Route path="/booth" element={
        <ProtectedRoute allowedRoles={['exhibitor']}>
          <BoothManagement />
        </ProtectedRoute>
      } />
      <Route path="/products" element={
        <ProtectedRoute allowedRoles={['exhibitor']}>
          <ProductManagement />
        </ProtectedRoute>
      } />

      {/* 观众路由 */}
      <Route path="/exhibitors" element={
        <ProtectedRoute allowedRoles={['visitor']}>
          <ExhibitorRecommendations />
        </ProtectedRoute>
      } />
      <Route path="/heatmap" element={
        <ProtectedRoute allowedRoles={['visitor']}>
          <HeatMap />
        </ProtectedRoute>
      } />
      <Route path="/ticket" element={
        <ProtectedRoute allowedRoles={['visitor']}>
          <ETicket />
        </ProtectedRoute>
      } />

      {/* 通用路由 */}
      <Route path="/meetings" element={
        <ProtectedRoute allowedRoles={['exhibitor', 'visitor']}>
          <ProductManagement />
        </ProtectedRoute>
      } />
      <Route path="/conferences" element={
        <ProtectedRoute>
          <ConferenceManagement />
        </ProtectedRoute>
      } />
      <Route path="/food" element={
        <ProtectedRoute>
          <FoodService />
        </ProtectedRoute>
      } />
      <Route path="/member" element={
        <ProtectedRoute>
          <MemberCenter />
        </ProtectedRoute>
      } />

      {/* 管理员路由 */}
      <Route path="/analytics" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Analytics />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Reports />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
};

export default App;
