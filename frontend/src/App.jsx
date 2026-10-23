import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Setup from './pages/Setup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Partners from './pages/Partners';
import Clients from './pages/Clients';
import ReferralForm from './pages/ReferralForm';
import PartnerDetail from './pages/PartnerDetail';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/referral/:code" element={<ReferralForm />} />
        <Route
          path="/admin/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/admin/partners"
          element={<ProtectedRoute><Partners /></ProtectedRoute>}
        />
        <Route
          path="/admin/partners/:id"
          element={<ProtectedRoute><PartnerDetail /></ProtectedRoute>}
        />
        <Route
          path="/admin/clients"
          element={<ProtectedRoute><Clients /></ProtectedRoute>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;