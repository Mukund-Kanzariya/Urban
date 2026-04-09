// Step 5: App setup with React Router
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';

// Import our new functional components!
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import MyBookings from './pages/MyBookings';
import ProviderDashboard from './pages/dashboards/ProviderDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import Experts from './pages/Experts';
import Profile from './pages/Profile';
import AddReview from './pages/AddReview';
import Footer from './components/Footer';

// ** Step 7: Critical Authorization Link! **
// If we have a JWT token stored locally, we forcefully attach it
// to EVERY SINGLE Axios request we ever send securely in the "Headers"
const token = sessionStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

function App() {
  return (
    // BrowserRouter gives its child components the ability to handle URLs
    <BrowserRouter>
      {/* Navbar sits outside Routes so it always shows up on every page */}
      <Navbar />

      {/* Routes container - each page manages its own layout */}
      <Routes>
        {/* Home page renders full-width (no container) */}
        <Route path="/" element={<Home />} />

        {/* These pages have their own containers */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services" element={<Services />} />
        <Route path="/experts" element={<Experts />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Authenticated Routes - wrapped in container */}
        <Route path="/profile" element={<div className="container"><Profile /></div>} />
        <Route path="/add-review/:bookingId" element={<div className="container"><AddReview /></div>} />

        {/* Dashboard Routes - wrapped in container */}
        <Route path="/bookings" element={<div className="container"><MyBookings /></div>} />
        <Route path="/dashboard/provider" element={<div className="container"><ProviderDashboard /></div>} />
        <Route path="/dashboard/admin" element={<div className="container"><AdminDashboard /></div>} />
        <Route path="/dashboard/super_admin" element={<div className="container"><AdminDashboard /></div>} />
      </Routes>

      {/* Global Footer appears on every page */}
      <Footer />
    </BrowserRouter>
  );
}

export default App;
