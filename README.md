# ⚡🚗 EV Parking & Charging Station System

## 🎯 Project Summary

A full-stack **MERN** (MongoDB, Express, React, Node.js) application for managing Electric Vehicle parking and charging stations. The system features two separate dashboards:

- **User Dashboard**: Browse slots, book parking, find charging stations
- **Admin Dashboard**: Manage slots, monitor bookings, analytics, and pricing

---

## ✨ Key Features

### 👥 User Features

- ✅ User Registration & Authentication
- ✅ Browse Available Parking Slots
- ✅ Real-time Slot Availability
- ✅ Book Parking Slots
- ✅ View Booking History
- ✅ Find Nearby Charging Stations
- ✅ Calculate Parking & Charging Costs
- ✅ Manage User Profile
- ✅ End Active Bookings

### 🎯 Admin Features

- ✅ Comprehensive Dashboard with Analytics
- ✅ Add/Edit/Delete Parking Slots
- ✅ Monitor All Bookings in Real-time
- ✅ Set Charging Rates & Pricing
- ✅ Configure Peak Hour Pricing
- ✅ Revenue Tracking & Analytics
- ✅ User Statistics
- ✅ Slot Utilization Reports
- ✅ Occupancy Rate Monitoring

### 🔧 Technical Features

- ✅ JWT Authentication
- ✅ Socket.io Real-time Updates
- ✅ Material-UI Professional UI
- ✅ Responsive Design
- ✅ Data Visualization (Charts)
- ✅ Error Handling & Validation
- ✅ RESTful API
- ✅ Secure Password Hashing

---

## 🏗️ Project Structure

```
EV_parking/
│
├── Backend/
│   ├── models/
│   │   ├── User.js              # User schema & authentication
│   │   ├── Booking.js           # Booking schema
│   │   ├── Slot.js              # Parking slot schema
│   │   ├── ChargingStation.js    # Charging station schema
│   │   └── ChargingRate.js       # Pricing schema
│   │
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   ├── bookingController.js  # Booking operations
│   │   ├── slotController.js     # Slot management
│   │   ├── chargingController.js # Charging operations
│   │   └── adminController.js    # Admin analytics
│   │
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── bookingRoutes.js      # Booking endpoints
│   │   ├── slotRoutes.js         # Slot endpoints
│   │   ├── chargingRoutes.js     # Charging endpoints
│   │   └── adminRoutes.js        # Admin endpoints
│   │
│   ├── middleware/
│   │   └── auth.js               # JWT verification
│   │
│   ├── server.js                 # Main server entry
│   ├── package.json              # Dependencies
│   └── .env                      # Configuration
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js         # Navigation component
│   │   │   ├── ProtectedRoute.js # Route protection
│   │   │   └── SlotCard.js       # Slot display component
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.js      # User login
│   │   │   ├── RegisterPage.js   # User registration
│   │   │   ├── user/
│   │   │   │   ├── Home.jsx      # User home
│   │   │   │   ├── BookingHistory.jsx  # Booking list
│   │   │   │   └── Profile.jsx   # User profile
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx    # Dashboard
│   │   │       ├── SlotManagement.jsx    # Slot CRUD
│   │   │       ├── BookingMonitor.jsx    # Booking monitor
│   │   │       └── ChargingRates.jsx     # Rate settings
│   │   │
│   │   ├── services/
│   │   │   └── api.js            # Axios configuration
│   │   │
│   │   ├── App.js                # Main routing
│   │   └── index.js              # React entry point
│   │
│   ├── package.json              # Dependencies
│   └── .env                      # Configuration
│
├── SETUP_GUIDE.md                # Initial setup overview
├── COMPLETE_GUIDE.md             # Comprehensive guide
├── QUICKSTART.md                 # 5-minute quick start
├── DATABASE_INIT.js              # MongoDB initialization
└── README.md                     # This file
```

---

## 🚀 Quick Start (5 minutes)

### Prerequisites

- Node.js v14+
- MongoDB (local or Atlas)
- Two terminal windows

### Backend

```bash
cd Backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### Frontend

```bash
cd Frontend
npm install
npm start
# App opens at http://localhost:3000
```


## 🔐 Authentication Flow

1. User enters credentials
2. Server validates and hashes password with bcrypt
3. JWT token generated on successful login
4. Token stored in localStorage
5. All API requests include Authorization header
6. Token verified on each protected route

---

## 💾 Database Schema

### Users

```javascript
{
  (name,
    email,
    password(hashed),
    phone,
    role(user / admin),
    vehicleNumber,
    vehicleType,
    isActive,
    timestamps);
}
```

### Parking Slots

```javascript
{
  (slotNumber(unique),
    level,
    status(available / occupied / maintenance),
    isChargingEnabled,
    chargingPower(kW),
    location(lat / lng),
    vehicleType,
    currentBookingId,
    timestamps);
}
```

### Bookings

```javascript
{
  (userId,
    slotId,
    startTime,
    endTime,
    duration(minutes),
    chargingDuration,
    status,
    parkingCost,
    chargingCost,
    totalCost,
    batteryChargedPercentage,
    timestamps);
}
```

### Charging Stations

```javascript
{
  (stationName,
    location(lat / lng / address),
    chargerType,
    availableChargers,
    totalChargers,
    operatingHours,
    isActive,
    timestamps);
}
```

### Charging Rates

```javascript
{
  (parkingRatePerHour,
    chargingRatePerKWh,
    peakHourStart / End,
    peakHourMultiplier,
    minimumParkingCharge,
    timestamps);
}
```

---

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/register     - Register
POST   /api/auth/login        - Login
GET    /api/auth/profile      - Get profile
PUT    /api/auth/profile      - Update profile
```

### Slots

```
GET    /api/slots/available   - Get available slots
GET    /api/slots/:id         - Get slot details
GET    /api/slots             - Get all (Admin)
POST   /api/slots             - Create (Admin)
PUT    /api/slots/:id         - Update (Admin)
DELETE /api/slots/:id         - Delete (Admin)
```

### Bookings

```
POST   /api/bookings                - Create
GET    /api/bookings/user/bookings  - User bookings
PUT    /api/bookings/:id/end        - End booking
GET    /api/bookings                - All (Admin)
```

### Charging

```
GET    /api/charging/rates         - Get rates
PUT    /api/charging/rates         - Update (Admin)
GET    /api/charging/stations      - Get stations
GET    /api/charging/nearest       - Nearest station
```

### Admin

```
GET    /api/admin/dashboard/stats     - Statistics
GET    /api/admin/bookings/recent     - Recent bookings
GET    /api/admin/analytics/revenue   - Revenue
GET    /api/admin/analytics/users     - Users
```

---

## 🎨 UI Components

### Material-UI Components Used

- AppBar, Card, Table, Dialog, TextField
- Button, Chip, Grid, Container, Box
- Alert, CircularProgress, Tabs, Menu
- Icons (DirectionsCar, ParkIcon, etc.)

### Custom Components

- **Navbar**: Navigation with user menu
- **ProtectedRoute**: Role-based access control
- **SlotCard**: Display parking slot info
- **Admin Dashboard**: Analytics & statistics
- **Booking Monitor**: All bookings table
- **Slot Management**: CRUD interface

---

## 🔄 Real-time Features (Socket.io)

The backend emits real-time events:

```javascript
socket.emit("slot-updated", data); // Slot changed
socket.emit("booking-created", data); // New booking
socket.emit("booking-ended", data); // Booking ended
```

---

## 💡 Technologies Used

| Category           | Technology                               |
| ------------------ | ---------------------------------------- |
| **Frontend**       | React 19, Material-UI 6, Axios, Recharts |
| **Backend**        | Node.js, Express 5, MongoDB, Mongoose    |
| **Database**       | MongoDB                                  |
| **Authentication** | JWT, Bcrypt                              |
| **Real-time**      | Socket.io                                |
| **HTTP Client**    | Axios                                    |
| **Routing**        | React Router 7                           |

---

## 🔍 Testing the Application

### Create a Booking

1. Login as user
2. Click "Available Slots"
3. Click "Book Now" on any slot
4. Confirm battery percentage
5. Booking created!

### Monitor Bookings (Admin)

1. Login as admin
2. Go to Bookings Monitor
3. View all active/completed bookings
4. Filter by status

### Manage Slots (Admin)

1. Go to Slot Management
2. Click "Add New Slot"
3. Fill in slot details
4. Save!

### Set Pricing (Admin)

1. Go to Charging Rates
2. Click "Edit Rates"
3. Modify parking/charging rates
4. Save!

---

## 📊 Cost Calculation

### Parking Cost

```
If duration < minimum: minimumParkingCharge
Else: (duration in hours) × parkingRatePerHour × (peak hour multiplier if applicable)
```

### Charging Cost

```
batteryChargedPercentage × chargingRatePerKWh
```

### Total Cost

```
Total = Parking Cost + Charging Cost
```

---

## 🚨 Error Handling

- Invalid credentials → 401 Unauthorized
- Missing token → 401 Unauthorized
- Insufficient permissions → 403 Forbidden
- Slot unavailable → 400 Bad Request
- Server errors → 500 Internal Server Error

---

## 🐛 Troubleshooting

| Issue                     | Solution                                 |
| ------------------------- | ---------------------------------------- |
| MongoDB connection failed | Check .env MONGO_URI and MongoDB service |
| Port already in use       | Kill process on port 5000/3000           |
| Cannot find module        | Run `npm install` again                  |
| CORS error                | Ensure FRONTEND_URL in backend .env      |
| Token invalid             | Clear localStorage and re-login          |

---

## 📝 Environment Variables

### Backend (.env)

```
MONGO_URI=mongodb://localhost:27017/ev_parking
JWT_SECRET=your_secret_key
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 🎓 Learning Resources

- [MERN Stack Tutorial](https://www.mongodb.com/languages/javascript/mern-stack)
- [Material-UI Docs](https://mui.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)

---

## 📦 Deployment

### Deploy Backend to Heroku

```bash
cd Backend
# Create Procfile: web: node server.js
git add .
git commit -m "Deploy"
git push heroku main
```

### Deploy Frontend to Vercel

```bash
cd Frontend
npm run build
vercel --prod
```

---

## 🤝 Contributing

This is an educational project. Feel free to:

- Add new features
- Improve UI/UX
- Optimize performance
- Add more tests

---

## 📞 Support

For issues:

1. Check browser console (F12)
2. Check backend terminal logs
3. Review error messages in UI
4. Check MongoDB connection
5. Verify .env configuration

---

## 📄 License

Educational/Open Source - Feel free to use and modify

---

## ✅ Checklist Before Production

- [ ] Change JWT_SECRET in .env
- [ ] Enable HTTPS
- [ ] Add input validation
- [ ] Add rate limiting
- [ ] Enable CORS properly
- [ ] Add logging
- [ ] Setup error monitoring
- [ ] Add database backups
- [ ] Setup CI/CD
- [ ] Add unit tests
- [ ] Setup security headers

---

## 🎉 You're Ready!

Your EV Parking System is fully set up!

**Start with:**

1. Run `npm install` in Backend
2. Run `npm run dev` to start backend
3. Run `npm install` in Frontend
4. Run `npm start` to start frontend
5. Login with demo credentials
6. Explore the application!

---

**Happy Coding! 🚗⚡**

_Built with ❤️ using MERN Stack_
