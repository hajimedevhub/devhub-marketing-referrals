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

// Partner pages
import PartnerLogin from './pages/partner/PartnerLogin';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import PartnerClients from './pages/partner/PartnerClients';
import PartnerClientDetail from './pages/partner/PartnerClientDetail';
import PartnerProtectedRoute from './components/PartnerProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/referral/:code" element={<ReferralForm />} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/partners" element={<ProtectedRoute><Partners /></ProtectedRoute>} />
        <Route path="/admin/partners/:id" element={<ProtectedRoute><PartnerDetail /></ProtectedRoute>} />
        <Route path="/admin/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />

        {/* Partner routes */}
        <Route path="/partner/login" element={<PartnerLogin />} />
        <Route path="/partner/dashboard" element={<PartnerProtectedRoute><PartnerDashboard /></PartnerProtectedRoute>} />
        <Route path="/partner/clients" element={<PartnerProtectedRoute><PartnerClients /></PartnerProtectedRoute>} />
        <Route path="/partner/clients/:id" element={<PartnerProtectedRoute><PartnerClientDetail /></PartnerProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;