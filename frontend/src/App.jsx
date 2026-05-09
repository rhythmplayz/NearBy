import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing.jsx';

// --- User Pages ---
import Login from './pages/user_pages/Login.jsx';
import Register from './pages/user_pages/Register.jsx';
import Home from './pages/user_pages/community/Home.jsx';
import Events from './pages/user_pages/community/Events.jsx';
import Profile from './pages/user_pages/community/Profile.jsx';
import Notifications from './pages/user_pages/community/Notifications.jsx';
import Shops from './pages/user_pages/marketplace/Shops.jsx';
import Cart from './pages/user_pages/marketplace/Cart.jsx';

// --- Seller Pages ---
import SellerLogin from './pages/seller_pages/Login.jsx';
import SellerRegister from './pages/seller_pages/Register.jsx';
import SubmitVerification from './pages/seller_pages/verifications/Submit.jsx';
import SellerDashboard from './pages/seller_pages/Dashboard.jsx';
import SellerNotifications from './pages/seller_pages/Notifications.jsx';
import SellerProfile from './pages/seller_pages/Profile.jsx';


import RiderLogin from './pages/rider_pages/Login.jsx';
import RiderRegister from './pages/rider_pages/Register.jsx';
import RiderDashboard from './pages/rider_pages/Dashboard.jsx';
import RiderReports from './pages/rider_pages/Reports.jsx';
import RiderNotifications from './pages/rider_pages/Notifications.jsx';
import RiderProfile from './pages/rider_pages/Profile.jsx';


import AdminLogin from './pages/admin_pages/Login.jsx';
import AdminSellerVerificationRequests from './pages/admin_pages/verifications/Requests.jsx';
import AdminSellerVerificationReview from './pages/admin_pages/verifications/Review.jsx';
import AdminRegister from './pages/admin_pages/RegisterAdmin.jsx';
import AdminDashboard from './pages/admin_pages/Dashboard.jsx';
import AdminReports from './pages/admin_pages/Reports.jsx';
import AdminNotifications from './pages/admin_pages/Notifications.jsx';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    // If no token, send them to the landing page or login
    return <Navigate to="/" replace />;
  }
  return children;
};


function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* --- Regular User Auth --- */}
        <Route path="/user/login" element={<Login />} />
        <Route path="/user/register" element={<Register />} />

        {/* --- Protected User Community Routes --- */}
        <Route path="/user/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/user/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
        <Route path="/user/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/user/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        {/* --- Protected User Marketplace Routes --- */}
        <Route path="/user/shops" element={<ProtectedRoute><Shops /></ProtectedRoute>} />
        <Route path="/user/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />

        {/* --- Seller Specific Routes --- */}
        <Route path="/seller/login" element={<SellerLogin />} />
        <Route path="/seller/register" element={<SellerRegister />} />
        <Route path="/seller/verify" element={<ProtectedRoute><SubmitVerification /></ProtectedRoute>} />
        <Route path="/seller/dashboard" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
        <Route path="/seller/notifications" element={<ProtectedRoute><SellerNotifications /></ProtectedRoute>} />
        <Route path="/seller/profile" element={<ProtectedRoute><SellerProfile /></ProtectedRoute>} />

        {/* --- Rider Specific Routes --- */}
        <Route path="/rider/login" element={<RiderLogin />} />
        <Route path="/rider/register" element={<RiderRegister />} />
        <Route path="/rider/dashboard" element={<ProtectedRoute><RiderDashboard /></ProtectedRoute>} />
        <Route path="/rider/reports" element={<ProtectedRoute><RiderReports /></ProtectedRoute>} />
        <Route path="/rider/notifications" element={<ProtectedRoute><RiderNotifications /></ProtectedRoute>} />
        <Route path="/rider/profile" element={<ProtectedRoute><RiderProfile /></ProtectedRoute>} />

        {/* --- Admin Specific Routes --- */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<ProtectedRoute><AdminRegister /></ProtectedRoute>} />

        {/* Main Admin Pages */}
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/verify-requests" element={<ProtectedRoute><AdminSellerVerificationRequests /></ProtectedRoute>} />
        <Route path="/admin/verifications/review/:pk" element={<ProtectedRoute><AdminSellerVerificationReview /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute><AdminNotifications /></ProtectedRoute>} />

        {/* 404 Redirect*/}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;