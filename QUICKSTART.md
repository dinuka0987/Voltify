# ⚡ EV Parking System - Quick Start

## 🚀 5-Minute Setup

### Prerequisites

- Node.js installed
- MongoDB running (local or Atlas)
- Two terminal windows open

---

## Terminal 1: Backend

```bash
# Navigate to backend
cd Backend

# Install dependencies
npm install

# Start server
npm run dev

# Expected: "MongoDB Connected" + "Server running on port 5000"
```

---

## Terminal 2: Frontend

```bash
# Navigate to frontend (new terminal)
cd Frontend

# Install dependencies
npm install

# Start development server
npm start

# Browser should auto-open to http://localhost:3000
```

---

## 🔐 Login Credentials

### Admin (Full Access)

- **Email:** admin@example.com
- **Password:** admin123

### User (Limited Access)

- **Email:** user@example.com
- **Password:** user123

> **Note:** Create these users either through:
>
> 1. Register page (http://localhost:3000/register)
> 2. MongoDB directly (see COMPLETE_GUIDE.md)
> 3. Admin user must be manually set role="admin" in database

---

## 📋 What You Can Do

### As Regular User:

- ✅ Browse available parking slots
- ✅ Book a slot
- ✅ View booking history
- ✅ Find charging stations
- ✅ Update profile

### As Admin:

- ✅ View dashboard with statistics
- ✅ Manage parking slots (add/edit/delete)
- ✅ Monitor all bookings
- ✅ Set charging rates
- ✅ View revenue analytics

---

## 🔗 Access Points

| Feature         | URL                                   |
| --------------- | ------------------------------------- |
| User Login      | http://localhost:3000                 |
| Register        | http://localhost:3000/register        |
| User Dashboard  | http://localhost:3000/user/home       |
| Admin Dashboard | http://localhost:3000/admin/dashboard |
| Backend API     | http://localhost:5000/api             |

---

## 🐛 Common Issues

### "Cannot connect to MongoDB"

- Check MONGO_URI in Backend/.env
- Ensure MongoDB service is running
- Use connection string format: `mongodb://localhost:27017/ev_parking`

### "Port already in use"

- Backend: Kill process on port 5000
- Frontend: Kill process on port 3000

### "npm install stuck"

```bash
npm cache clean --force
npm install
```

---

## 📝 API Examples

### Create a Booking (User)

```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slotId": "SLOT_ID"}'
```

### Create a Slot (Admin)

```bash
curl -X POST http://localhost:5000/api/slots \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slotNumber": "A-01",
    "level": 1,
    "vehicleType": "sedan",
    "isChargingEnabled": true,
    "chargingPower": 7.4
  }'
```

---

## 📚 Directory Structure

```
Backend/
├── controllers/    # Business logic
├── models/        # Database schemas
├── routes/        # API endpoints
├── middleware/    # Auth & validation
└── server.js      # Main entry point

Frontend/
├── components/    # Reusable UI components
├── pages/        # Full page components
├── App.js        # Main app routing
└── index.js      # React entry point
```

---

## 🎨 UI Features

- Material-UI (Professional components)
- Responsive design (works on mobile & desktop)
- Real-time updates with Socket.io
- Charts with Recharts
- Form validation
- Error handling with alerts

---

## 📖 Full Documentation

For detailed setup, deployment, and API documentation, see:

- **COMPLETE_GUIDE.md** - Comprehensive guide
- **SETUP_GUIDE.md** - Initial overview

---

## ✅ Checklist

- [ ] Node.js installed
- [ ] MongoDB running
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend server running (port 5000)
- [ ] Frontend running (port 3000)
- [ ] Can access http://localhost:3000
- [ ] Can login with credentials
- [ ] Can view slots
- [ ] Can create booking

---

**You're all set! Start exploring! 🚗⚡**
