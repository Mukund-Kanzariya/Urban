# Local Service Provider Platform

A comprehensive, deployment-ready web application connecting customers with nearby local service providers such as electricians, plumbers, tutors, cleaners, mechanics, carpenters, painters, and pest control workers.

## 🌟 Overview

This platform facilitates the secure booking of skilled local professionals. It features distinct interfaces for Customers to discover and book services, for Providers to manage their schedules and earnings, and for Administrators to oversee platform operations.

## 🚀 Tech Stack

### Frontend
- **React.js 18** (Vite build tool)
- **Tailwind CSS** for responsive, utility-first styling
- **React Router v6** for navigation
- **React Context API + useReducer** for global state management
- **Axios** with interceptors for API communication
- **Lucide React** for modern iconography
- **React Hot Toast** for aesthetic notifications
- **React Hook Form** for robust form handling and validation
- **Recharts** for interactive admin and provider analytics

### Backend
- **Node.js & Express.js** for the RESTful API
- **MongoDB & Mongoose ODM** for database operations
- **JSON Web Tokens (JWT) & bcryptjs** for secure authentication
- **Nodemailer** for email notifications (mock/testing)
- **express-validator** for request payload validation
- **Helmet, CORS** for security enhancements

## 📂 Project Structure

```
localServiceProvider/
├── backend/                  # Node.js API server
│   ├── config/               # Database and other configurations
│   ├── controllers/          # Route handlers (business logic)
│   ├── middlewares/          # Custom auth, role, and error middlewares
│   ├── models/               # Mongoose database schemas
│   ├── routes/               # Express API routes
│   ├── seed/                 # Database population scripts
│   ├── utils/                # Helper functions (tokens, emails, etc.)
│   ├── server.js             # Main application entry point
│   ├── .env                  # Environment variables
│   └── package.json          # Backend dependencies
│
└── frontend/                 # React frontend application
    ├── public/               # Static assets
    ├── src/
    │   ├── api/              # Axios configuration and API services
    │   ├── components/       # Reusable UI components (Cards, Navbar, etc.)
    │   ├── context/          # Global state contexts (AuthContext)
    │   ├── pages/            # Application views/routes
    │   ├── App.jsx           # Main routing component
    │   ├── main.jsx          # React initialization
    │   └── index.css         # Tailwind directives and custom styles
    ├── vite.config.js        # Vite bundler configuration
    ├── tailwind.config.js    # Tailwind theme configuration
    └── package.json          # Frontend dependencies
```

## 🛠️ Setup Guide

Follow these steps to run the project locally.

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (Local installation or MongoDB Atlas URI)

### 2. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create environment variables file
cat .env.example > .env
# Edit the .env file with your specific MongoDB URI and JWT Secret

# Seed the database with initial categories, test users, and sample data
npm run seed

# Start the development server (runs on port 5000)
npm run dev
```

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server (runs on port 5173 by default)
npm run dev
```

The application should now be accessible at `http://localhost:5173`.

## 🧪 Test Credentials

After running the `npm run seed` command, you can use the following accounts to test the application:

| Role | Email | Password | Features |
|------|-------|----------|----------|
| **Admin** | admin@example.com | admin123 | Full platform control, user management, global analytics |
| **Provider** | provider@example.com | password123 | Profile management, service creation, incoming booking request handling |
| **Customer** | customer@example.com | password123 | Service searching, provider reviewing, booking creation |

*(Note: Data created by the seed script is randomized for some fields like reviews and dates)*

## 📡 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /register` - Register new user (customer/provider)
- `POST /login` - Authenticate user & get token
- `POST /logout` - Clear authentication cookie
- `GET /me` - Get current user profile
- `PUT /updatedetails` - Update user details

### Services (`/api/services`)
- `GET /` - Get all services (supports filtering, sorting, pagination)
- `GET /:id` - Get single service details
- `POST /` - Create a service (Provider only)
- `PUT /:id` - Update a service (Provider only)
- `DELETE /:id` - Delete a service (Provider/Admin)

### Bookings (`/api/bookings`)
- `GET /my-bookings` - Get current customer's bookings
- `GET /provider-bookings` - Get current provider's bookings
- `POST /` - Create a new booking
- `PUT /:id/confirm` - Accept a booking request (Provider only)
- `PUT /:id/reject` - Reject a booking request (Provider only)
- `PUT /:id/complete` - Mark booking as finished (Provider only)
- `PUT /:id/cancel` - Cancel a pending booking (Customer only)

### Admin (`/api/admin`)
- `GET /stats` - Comprehensive platform statistics
- `GET /users` - List out application users
- `PUT /users/:id/status` - Activate/Deactivate users
- `DELETE /users/:id` - Remove user from platform
- `GET /categories` - System service categories management

*(See the actual route files for comprehensive endpoint parameters and required bodies)*

## 📸 Screenshots
*(To be added)*

## 🌍 Deployment Guide

### Backend (Render, Heroku, or DigitalOcean)
1. Ensure all environment variables (`MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`) are set in your hosting provider's dashboard.
2. The `backend/server.js` file is configured to serve the frontend build if placed in a specific structure, but for Vercel/Netlify, separating them is recommended.
3. Use `npm start` (points to `node server.js`) as the start command.

### Frontend (Vercel or Netlify)
1. Connect your GitHub repository to Vercel/Netlify.
2. Set the build command to `npm run build`.
3. Set the output directory to `dist`.
4. Ensure you add environment variables, specifically proxy settings or creating `.env.production` replacing API base endpoints. Add a rewrite rule for React Router if necessary.

---
*Created as part of MCA Semester 2 academic project requirements.*
