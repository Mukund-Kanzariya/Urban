import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  // Grab the simple cached user out of browser storage
  // If no user exists, fallback to an empty {} object to avoid crashes
  const user = JSON.parse(sessionStorage.getItem('user')) || {};
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // Fetch personal dashboard data safely using the Axios interceptor token!
    axios.get('/api/bookings')
      .then((res) => setBookings(res.data))
      .catch((err) => console.log('Error fetching dashboard data'));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome, {user.name || 'User'}! You are logged in as a <strong>{user.role || 'Visitor'}</strong>.</p>
      
      <div className="card">
        <h3>My Bookings</h3>
        {bookings.length === 0 ? <p>No bookings yet!</p> : (
          bookings.map((b) => (
            <div key={b._id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
              <p><strong>Service:</strong> {b.serviceId?.title}</p>
              <p><strong>Date & Time:</strong> {b.date} at {b.time}</p>
              <p><strong>Status:</strong> {b.status}</p>
            </div>
          ))
        )}
      </div>

      {/* Conditional Rendering: Only Providers can see tools to add services */}
      {user.role === 'provider' && (
         <div className="card">
           <h3>Provider Tools</h3>
           <button onClick={() => alert('Add Service Form logic can go here!')}>Add New Service</button>
         </div>
      )}
    </div>
  );
}

export default Dashboard;
