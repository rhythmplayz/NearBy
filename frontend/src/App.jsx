import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import { getValidStoredToken } from './utils/authSession';

// --- User Pages ---
import Login from './pages/user_pages/Login.jsx';
import Register from './pages/user_pages/Register.jsx';
import Home from './pages/user_pages/community/Home.jsx';
import Events from './pages/user_pages/community/Events.jsx';
import UserProfile from './pages/user_pages/community/Profile.jsx';

// --- Seller Pages ---
import SellerLogin from './pages/seller_pages/Login.jsx';
import SellerRegister from './pages/seller_pages/Register.jsx';
import SubmitVerification from './pages/seller_pages/verifications/Submit.jsx';


import RiderLogin from './pages/rider_pages/Login.jsx';
import RiderRegister from './pages/rider_pages/Register.jsx';
import RiderDashboard from './pages/rider_pages/Dashboard.jsx';
import RiderProfile from './pages/rider_pages/Profile.jsx';

import AdminLogin from './pages/admin_pages/Login.jsx';
import AdminDashboard from './pages/admin_pages/Dashboard.jsx';
import AdminProfile from './pages/admin_pages/Profile.jsx';
import AdminSellerVerificationRequests from './pages/admin_pages/verifications/Requests.jsx';
import AdminSellerVerificationReview from './pages/admin_pages/verifications/Review.jsx';
import AdminRiderReports from './pages/admin_pages/rider_reports/Reports.jsx';
import AdminRegister from './pages/admin_pages/RegisterAdmin.jsx';
import SellerProfile from './pages/seller_pages/Profile.jsx';

const ProtectedRoute = ({ children }) => {
  const token = getValidStoredToken();
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const SellerDashboard = () => <div style={{ padding: '50px', textAlign: 'center' }}><h1>Seller Dashboard</h1><p>Welcome to your business portal.</p></div>;

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* --- Regular User Routes --- */}
        <Route path="/user/login" element={<Login />} />
        <Route path="/user/register" element={<Register />} />
        <Route path="/user/home" element={<Home />} />
        <Route path="/user/events" element={<Events />} />
        <Route path="/user/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

        {/* --- Seller Specific Routes --- */}
        <Route path="/seller/login" element={<SellerLogin />} />
        <Route path="/seller/register" element={<SellerRegister />} />
        <Route path="/seller/dashboard" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
        <Route path="/seller/verify" element={<ProtectedRoute><SubmitVerification /></ProtectedRoute>} />
        <Route path="/seller/profile" element={<ProtectedRoute><SellerProfile /></ProtectedRoute>} />

        {/* --- Rider Specific Routes --- */}
        <Route path="/rider/login" element={<RiderLogin />} />
        <Route path="/rider/register" element={<RiderRegister />} />
        <Route path="/rider/dashboard" element={<ProtectedRoute><RiderDashboard /></ProtectedRoute>} />
        <Route path="/rider/profile" element={<ProtectedRoute><RiderProfile /></ProtectedRoute>} />

        {/* --- Admin Specific Routes --- */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<ProtectedRoute><AdminRegister /></ProtectedRoute>} />

        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
        <Route path="/admin/rider-reports" element={<ProtectedRoute><AdminRiderReports /></ProtectedRoute>} />
        <Route path="/admin/verify-requests" element={<ProtectedRoute><AdminSellerVerificationRequests /></ProtectedRoute>} />
        <Route path="/admin/verifications/review/:pk" element={<ProtectedRoute><AdminSellerVerificationReview /></ProtectedRoute>} />

        {/* 404 Redirect*/}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;