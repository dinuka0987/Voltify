# EV Parking & Charging Station - MERN Stack Setup Guide

## 📋 Project Overview

A complete MERN stack application for managing EV parking and charging stations with admin controls and real-time user features.

### Features:

- **Admin Dashboard**: Manage slots, monitor bookings, set charging rates
- **User Dashboard**: View available slots, book parking, track charging
- **Real-time Updates**: Socket.io integration for live slot availability
- **Location Services**: Distance to nearest charging station
- **Professional UI**: Material-UI components

---

## 🚀 STEP 1: Environment Setup

### Backend (.env file)

Create `Backend/.env`:

```
MONGO_URI=mongodb://localhost:27017/ev_parking
JWT_SECRET=your_jwt_secret_key_here_change_this
PORT=5000
NODE_ENV=development
```

### Frontend (.env file)

Create `Frontend/.env`:

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 📦 STEP 2: Install Dependencies

### Backend

```bash
cd Backend
npm install express mongoose cors dotenv jsonwebtoken bcryptjs socket.io http
npm install --save-dev nodemon
```

### Frontend

```bash
cd Frontend
npm install axios react-router-dom socket.io-client
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install @mui/lab
```

---

## 🗄️ STEP 3: Database Models

Create MongoDB models for:

- User (admin & user roles)
- ParkingSlot (slot management)
- ChargingStation (station info)
- Booking (reservation history)
- ChargingRate (pricing)

---

## 🔌 STEP 4: Backend API Routes

Create the following API endpoints:

- **Auth**: Login, Register, Profile
- **Slots**: Get all, Create, Update, Delete, Get availability
- **Bookings**: Create, Get history, End booking
- **Charging**: Get stations, Calculate distance
- **Admin**: Dashboard stats, Manage slots & rates

---

## 🎨 STEP 5: Frontend Pages

- **User**: Login, Home, Available Slots, Booking History, Current Booking
- **Admin**: Dashboard, Slot Management, Booking Monitor, Charging Rates
- **Components**: Navbar, Sidebar, Slot Card, Booking Modal

---

## 🔗 STEP 6: Real-time Features with Socket.io

- Broadcast slot availability changes
- Live booking updates
- Real-time charging status

---

## ▶️ STEP 7: Running the Application

### Terminal 1 - Backend

```bash
cd Backend
npm run dev
```

### Terminal 2 - Frontend

```bash
cd Frontend
npm start
```

---

## 📍 Access Points

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
