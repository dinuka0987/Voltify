// MongoDB Database Initialization Script
// Run in MongoDB Compass or Mongosh

// ============================================
// 1. CREATE DATABASE
// ============================================
use ev_parking

// ============================================
// 2. CREATE COLLECTIONS
// ============================================

// Users Collection
db.createCollection("users")

// Slots Collection  
db.createCollection("slots")

// Bookings Collection
db.createCollection("bookings")

// Charging Stations Collection
db.createCollection("chargingstations")

// Charging Rates Collection
db.createCollection("chargingrates")

// ============================================
// 3. INSERT SAMPLE DATA
// ============================================

// 3.1 Insert Admin User
// Password hash: $2a$10$... (generate using bcrypt online or in code)
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$q0wh.5gQwpRFDmcQS9KPn.qs21j0XeVN.M8Oj6JkzK5a..CfE16fS", // admin123
  phone: "123-456-7890",
  role: "admin",
  vehicleNumber: "ADMIN001",
  vehicleType: "sedan",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

// 3.2 Insert Sample User
db.users.insertOne({
  name: "John Doe",
  email: "user@example.com",
  password: "$2a$10$VyT5cAQwpRFDmcQS9KPn.qs21j0XeVN.M8Oj6JkzK5a..CfE16fS", // user123
  phone: "987-654-3210",
  role: "user",
  vehicleNumber: "EV-2024-001",
  vehicleType: "sedan",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

// 3.3 Insert Parking Slots
db.slots.insertMany([
  {
    slotNumber: "A-01",
    level: 1,
    status: "available",
    isChargingEnabled: true,
    chargingPower: 7.4,
    location: {
      lat: 40.7128,
      lng: -74.0060
    },
    vehicleType: "sedan",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slotNumber: "A-02",
    level: 1,
    status: "available",
    isChargingEnabled: true,
    chargingPower: 11,
    location: {
      lat: 40.7150,
      lng: -74.0065
    },
    vehicleType: "suv",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slotNumber: "A-03",
    level: 1,
    status: "available",
    isChargingEnabled: true,
    chargingPower: 7.4,
    location: {
      lat: 40.7170,
      lng: -74.0070
    },
    vehicleType: "hatchback",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slotNumber: "B-01",
    level: 2,
    status: "available",
    isChargingEnabled: true,
    chargingPower: 22,
    location: {
      lat: 40.7190,
      lng: -74.0075
    },
    vehicleType: "sedan",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slotNumber: "B-02",
    level: 2,
    status: "maintenance",
    isChargingEnabled: false,
    chargingPower: 0,
    location: {
      lat: 40.7210,
      lng: -74.0080
    },
    vehicleType: "truck",
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// 3.4 Insert Charging Stations
db.chargingstations.insertMany([
  {
    stationName: "Colombo Fort EV Charging Hub",
    location: {
      lat: 6.9344,
      lng: 79.8428,
      address: "Lotus Road, Colombo Fort, Colombo 00100"
    },
    chargerType: "DC-Fast",
    availableChargers: 3,
    totalChargers: 6,
    operatingHours: {
      open: "06:00",
      close: "23:00"
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    stationName: "Bambalapitiya Level 2 Charging Point",
    location: {
      lat: 6.8886,
      lng: 79.8563,
      address: "Galle Road, Bambalapitiya, Colombo 00400"
    },
    chargerType: "Level2",
    availableChargers: 4,
    totalChargers: 8,
    operatingHours: {
      open: "07:00",
      close: "22:00"
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// 3.5 Insert Charging Rates
db.chargingrates.insertOne({
  parkingRatePerHour: 5,
  chargingRatePerKWh: 0.25,
  peakHourStart: "08:00",
  peakHourEnd: "18:00",
  peakHourMultiplier: 1.5,
  minimumParkingCharge: 2,
  createdAt: new Date(),
  updatedAt: new Date()
})

// ============================================
// 4. CREATE INDEXES
// ============================================

// User indexes
db.users.createIndex({ email: 1 }, { unique: true })

// Slot indexes
db.slots.createIndex({ slotNumber: 1 }, { unique: true })
db.slots.createIndex({ status: 1 })

// Booking indexes
db.bookings.createIndex({ userId: 1 })
db.bookings.createIndex({ slotId: 1 })
db.bookings.createIndex({ status: 1 })

// ============================================
// 5. VERIFY DATA
// ============================================

// Count documents
db.users.countDocuments()        // Should return 2
db.slots.countDocuments()        // Should return 5
db.chargingstations.countDocuments()  // Should return 2
db.chargingrates.countDocuments()     // Should return 1

// View sample data
db.users.findOne()
db.slots.findOne()
db.chargingstations.findOne()

// ============================================
// END OF SCRIPT
// ============================================
