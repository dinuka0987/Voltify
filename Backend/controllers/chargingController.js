const ChargingRate = require("../models/ChargingRate");
const ChargingStation = require("../models/ChargingStation");
const mongoose = require("mongoose");
const { createNotification } = require("./notificationController");

const sampleChargingStations = [
  {
    stationName: "Colombo Fort EV Charging Hub",
    location: {
      lat: 6.9344,
      lng: 79.8428,
      address: "Lotus Road, Colombo Fort, Colombo 00100",
    },
    chargerType: "DC-Fast",
    availableChargers: 3,
    totalChargers: 6,
    operatingHours: {
      open: "06:00",
      close: "23:00",
    },
    isActive: true,
  },
  {
    stationName: "Bambalapitiya Level 2 Charging Point",
    location: {
      lat: 6.8886,
      lng: 79.8563,
      address: "Galle Road, Bambalapitiya, Colombo 00400",
    },
    chargerType: "Level2",
    availableChargers: 4,
    totalChargers: 8,
    operatingHours: {
      open: "07:00",
      close: "22:00",
    },
    isActive: true,
  },
];

// Get charging rates
exports.getChargingRates = async (req, res) => {
  try {
    let rates = await ChargingRate.findOne();

    if (!rates) {
      rates = new ChargingRate();
      await rates.save();
    }

    res.json(rates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update charging rates (Admin)
exports.updateChargingRates = async (req, res) => {
  try {
    const { parkingRatePerHour, chargingRatePerKWh, peakHourStart, peakHourEnd, peakHourMultiplier, minimumParkingCharge } = req.body;

    let rates = await ChargingRate.findOne();

    if (!rates) {
      rates = new ChargingRate();
    }

    if (parkingRatePerHour !== undefined) rates.parkingRatePerHour = parkingRatePerHour;
    if (chargingRatePerKWh !== undefined) rates.chargingRatePerKWh = chargingRatePerKWh;
    if (peakHourStart !== undefined) rates.peakHourStart = peakHourStart;
    if (peakHourEnd !== undefined) rates.peakHourEnd = peakHourEnd;
    if (peakHourMultiplier !== undefined) rates.peakHourMultiplier = peakHourMultiplier;
    if (minimumParkingCharge !== undefined) rates.minimumParkingCharge = minimumParkingCharge;

    await rates.save();

    if (req.io) {
      await createNotification(req.io, {
        userId: null,
        type: "system",
        priority: "normal",
        title: "Rate Changes",
        message: `Charging and parking rates have been updated. New charging rate: $${rates.chargingRatePerKWh}/kWh.`,
        actionUrl: "/user/home",
        actionLabel: "View Map",
      });
    }

    res.json({ message: "Charging rates updated successfully", rates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all charging stations
exports.getChargingStations = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(sampleChargingStations);
    }

    let stations = await ChargingStation.find({ isActive: true });

    if (stations.length === 0) {
      stations = await ChargingStation.insertMany(sampleChargingStations);
    }

    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get nearest charging station
exports.getNearestStation = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude required" });
    }

    const stations = await ChargingStation.find({ isActive: true });

    if (stations.length === 0) {
      return res.status(404).json({ message: "No charging stations available" });
    }

    // Calculate distance using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const stationsWithDistance = stations.map((station) => ({
      ...station.toObject(),
      distance: calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        station.location.lat,
        station.location.lng
      ),
    }));

    stationsWithDistance.sort((a, b) => a.distance - b.distance);

    res.json(stationsWithDistance[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create charging station (Admin)
exports.createChargingStation = async (req, res) => {
  try {
    const { stationName, location, chargerType, availableChargers, totalChargers, operatingHours } = req.body;

    const newStation = new ChargingStation({
      stationName,
      location,
      chargerType,
      availableChargers,
      totalChargers,
      operatingHours,
    });

    await newStation.save();

    res.status(201).json({ message: "Charging station created", station: newStation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update charging station (Admin)
exports.updateChargingStation = async (req, res) => {
  try {
    const { stationId } = req.params;
    const updateData = req.body;

    const updatedStation = await ChargingStation.findByIdAndUpdate(stationId, updateData, { new: true });

    if (!updatedStation) {
      return res.status(404).json({ message: "Station not found" });
    }

    res.json({ message: "Station updated successfully", station: updatedStation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
