# 🚗⚡ EV Parking & Charging Station System - Complete Setup Guide

## Project Overview

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing Electric Vehicle parking and charging stations with separate admin and user dashboards.

### Key Features

✅ User authentication (Login/Register)
✅ Real-time slot availability
✅ Booking management system
✅ Charging station locator
✅ Admin dashboard with analytics
✅ Revenue tracking and reporting
✅ Professional Material-UI interface
✅ Socket.io real-time updates

---

## 📋 Prerequisites

Before starting, ensure you have installed:

- **Node.js** (v14+) - Download from https://nodejs.org
- **MongoDB** - https://www.mongodb.com/try/download/community
  - Or use MongoDB Atlas (Cloud): https://www.mongodb.com/cloud/atlas
- **Git** - https://git-scm.com

---

## 🚀 Step 1: Database Setup (MongoDB)

### Option A: Local MongoDB

```bash
# For Windows - Start MongoDB service
net start MongoDB
# or use Mongosh CLI
mongosh
```

### Option B: MongoDB Atlas (Recommended - Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/ev_parking`

---

## 🔧 Step 2: Backend Setup

### 1. Navigate to Backend Directory

```bash
cd Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create/Update .env File

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://your_user:your_password@cluster0.mongodb.net/ev_parking
# or for local: mongodb://localhost:27017/ev_parking

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_12345

# Server Port
PORT=5000

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 4. Update Backend Scripts (package.json)

Edit `Backend/package.json` and update scripts section:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### 5. Start Backend Server

```bash
npm run dev
```

Expected output:

```
MongoDB Connected
Server running on port 5000
```

---

## 🎨 Step 3: Frontend Setup

### 1. Navigate to Frontend Directory (in new terminal)

```bash
cd Frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Verify .env File

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Start Frontend Development Server

```bash
npm start
```

Expected: Browser opens to http://localhost:3000

---

## 📝 Step 4: Create Demo Admin & User

### Using MongoDB/Mongosh Console

#### Create Admin User (Hashed Password: admin123)

```javascript
use ev_parking

db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$...", // Use bcrypt to hash
  phone: "123-456-7890",
  role: "admin",
  vehicleNumber: "ADMIN001",
  vehicleType: "sedan",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**OR** Register through UI and then update role via:

```javascript
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } });
```

#### Create Sample User (Password: user123)

- Use the Register page at http://localhost:3000/register
- Or insert via MongoDB

#### Create Sample Slots

```javascript
db.slots.insertMany([
  {
    slotNumber: "A-01",
    level: 1,
    status: "available",
    isChargingEnabled: true,
    chargingPower: 7.4,
    location: { lat: 40.7128, lng: -74.006 },
    vehicleType: "sedan",
    createdAt: new Date(),
  },
  {
    slotNumber: "A-02",
    level: 1,
    status: "available",
    isChargingEnabled: true,
    chargingPower: 11,
    location: { lat: 40.715, lng: -74.0065 },
    vehicleType: "suv",
    createdAt: new Date(),
  },
  // Add more slots as needed
]);
```

#### Create Sample Charging Station

```javascript
db.chargingstations.insertOne({
  stationName: "Downtown Charging Hub",
  location: {
    lat: 40.72,
    lng: -74.01,
    address: "123 Main St, New York, NY 10001",
  },
  chargerType: "Level2",
  availableChargers: 5,
  totalChargers: 10,
  operatingHours: {
    open: "06:00",
    close: "23:00",
  },
  isActive: true,
  createdAt: new Date(),
});
```

---

## 🔐 Login Credentials

### Demo Admin Account

- **Email:** admin@example.com
- **Password:** admin123 (or your chosen password)

### Demo User Account

- **Email:** user@example.com
- **Password:** user123 (or your chosen password)

---

## 📱 User Dashboard Features

After login, users can:

1. **View Available Slots**
   - Browse all available parking slots
   - See charging power (kW)
   - Filter by vehicle type

2. **Book Slot**
   - Select desired slot
   - Confirm battery charge percentage
   - System creates booking

3. **View Booking History**
   - Current and past bookings
   - Duration and cost breakdown
   - Parking cost + Charging cost
   - End active bookings

4. **Find Charging Stations**
   - View nearby charging stations
   - Available chargers info
   - Operating hours
   - Get directions

5. **Manage Profile**
   - Update vehicle information
   - Change phone number
   - Update vehicle type

---

## 🎯 Admin Dashboard Features

After admin login, you can:

1. **Dashboard Overview**
   - Total slots and availability
   - Occupancy rate
   - Total revenue
   - Active bookings count
   - User statistics
   - Recent bookings table
   - Slot distribution chart

2. **Slot Management**
   - View all slots
   - Add new slots
   - Edit slot properties
   - Delete slots
   - Set charging power
   - Assign vehicle types

3. **Booking Monitor**
   - View all bookings
   - Filter by status (active/completed/cancelled)
   - See duration calculation
   - Monitor parking and charging costs
   - Track total revenue per booking

4. **Charging Rates**
   - Set parking rate (per hour)
   - Set charging rate (per kWh)
   - Configure peak hours
   - Set peak hour multiplier
   - Set minimum parking charge

---

## 🔌 API Endpoints Reference

### Authentication

```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - User login
GET    /api/auth/profile      - Get user profile
PUT    /api/auth/profile      - Update profile
```

### Slots

```
GET    /api/slots/available   - Get available slots
GET    /api/slots/:id         - Get slot details
GET    /api/slots             - Get all slots (Admin)
POST   /api/slots             - Create slot (Admin)
PUT    /api/slots/:id         - Update slot (Admin)
DELETE /api/slots/:id         - Delete slot (Admin)
```

### Bookings

```
POST   /api/bookings                - Create booking
GET    /api/bookings/user/bookings  - Get user bookings
PUT    /api/bookings/:bookingId/end - End booking
GET    /api/bookings                - Get all bookings (Admin)
```

### Charging

```
GET    /api/charging/rates             - Get charging rates
PUT    /api/charging/rates             - Update rates (Admin)
GET    /api/charging/stations          - Get all stations
GET    /api/charging/nearest           - Get nearest station
POST   /api/charging/stations          - Create station (Admin)
```

### Admin

```
GET    /api/admin/dashboard/stats      - Dashboard statistics
GET    /api/admin/bookings/recent      - Recent bookings
GET    /api/admin/analytics/revenue    - Revenue analytics
GET    /api/admin/analytics/users      - User statistics
```

---

## 🐛 Troubleshooting

### "MongoDB Connection Failed"

- Check .env MONGO_URI
- Ensure MongoDB is running
- Verify credentials if using Atlas

### "Port 5000/3000 Already in Use"

```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### "Cannot find module"

```bash
cd Backend  # or Frontend
npm install
```

### "CORS Error"

- Check backend CORS configuration in server.js
- Ensure FRONTEND_URL is correct in .env

---

## 📦 Deployment

### Deploy Backend (Heroku/Render)

```bash
# Add Procfile in Backend/
# web: node server.js

# Push to Heroku
heroku create your-app-name
git push heroku main
```

### Deploy Frontend (Vercel/Netlify)

```bash
# Build production bundle
cd Frontend
npm run build

# Deploy to Vercel
npm i -g vercel
vercel
```

---

## 🎓 Project Structure

```
EV_parking/
├── Backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Booking.js
│   │   ├── Slot.js
│   │   ├── ChargingStation.js
│   │   └── ChargingRate.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── slotController.js
│   │   ├── chargingController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── slotRoutes.js
│   │   ├── chargingRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── .env
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── ProtectedRoute.js
│   │   │   └── SlotCard.js
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── user/
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── BookingHistory.jsx
│   │   │   │   └── Profile.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── SlotManagement.jsx
│   │   │       ├── BookingMonitor.jsx
│   │   │       └── ChargingRates.jsx
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   └── package.json
│
└── SETUP_GUIDE.md
```

---

## 🚀 Quick Start Commands

### Terminal 1 - Backend

```bash
cd Backend
npm install
npm run dev
```

### Terminal 2 - Frontend

```bash
cd Frontend
npm install
npm start
```

Then access:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 💡 Key Technologies

- **Frontend:** React 19, Material-UI 6, React Router 7, Axios, Recharts
- **Backend:** Node.js, Express 5, MongoDB, Mongoose, JWT, Bcrypt, Socket.io
- **Database:** MongoDB with Atlas cloud option
- **Real-time:** Socket.io for live updates
- **UI Components:** Material-UI (MUI)
- **Charts:** Recharts for data visualization

---

## 📞 Support & Contact

For issues or questions, review the code comments and error messages in the browser console and terminal output.

---

## 📄 License

This project is open source and available for educational purposes.

---

**Happy Coding! ⚡🚗**
