// Step 5: App setup with React Router
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';

// Import our new functional components!
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/dashboards/CustomerDashboard';
import ProviderDashboard from './pages/dashboards/ProviderDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import Profile from './pages/Profile';
import AddReview from './pages/AddReview';

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

      <div className="container">

        {/* The Routes container controls which Page shows up based on the URL */}
        <Routes>
          {/* Think of these essentially as if-statements mapping URLs to Pages! */}
          {/* Standard Navigation Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />

          {/* Secure User Management Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Universal Authenticated Routes */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/add-review/:bookingId" element={<AddReview />} />

          {/* Context-Aware Dynamic Dashboard Route */}
          <Route path="/dashboard/customer" element={<CustomerDashboard />} />
          <Route path="/dashboard/provider" element={<ProviderDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
