import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- User Pages ---
import Login from './pages/user_pages/Login.jsx';
import Register from './pages/user_pages/Register.jsx';
import Home from './pages/user_pages/community/Home.jsx';
import Events from './pages/user_pages/community/Events.jsx';
import Profile from './pages/user_pages/community/Profile.jsx';

// --- Seller Pages ---
import SellerLogin from './pages/seller_pages/Login.jsx';
import SellerRegister from './pages/seller_pages/Register.jsx';

// Placeholder for Seller Dashboard (You'll create this later)
const SellerDashboard = () => <div style={{ padding: '50px', textAlign: 'center' }}><h1>Seller Dashboard</h1><p>Welcome to your business portal.</p></div>;

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/user/login" />} />

        {/* --- Regular User Routes --- */}
        <Route path="/user/login" element={<Login />} />
        <Route path="/user/register" element={<Register />} />
        <Route path="/user/home" element={<Home />} />
        <Route path="/user/events" element={<Events />} />
        <Route path="/user/profile" element={<Profile />} />

        {/* --- Seller Specific Routes --- */}
        <Route path="/seller/login" element={<SellerLogin />} />
        <Route path="/seller/register" element={<SellerRegister />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />

        {/* 404 Redirect*/}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;