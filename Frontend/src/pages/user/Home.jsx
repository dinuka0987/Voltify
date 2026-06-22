import DirectionsIcon from "@mui/icons-material/Directions";
import MapIcon from "@mui/icons-material/Map";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import NearMeIcon from "@mui/icons-material/NearMe";
import EvStationIcon from "@mui/icons-material/EvStation";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Slider,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import SlotCard from "../../components/SlotCard";
import LiveChargingWidget from "../../components/LiveChargingWidget";
import API from "../../services/api";
import socket from "../../socket";

const calculateDistance = (from, to) => {
  if (!from || !to?.lat || !to?.lng) return null;

  const earthRadiusKm = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const isStationOpen = (operatingHours) => {
  if (!operatingHours?.open || !operatingHours?.close) return null;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMinute] = operatingHours.open.split(":").map(Number);
  const [closeHour, closeMinute] = operatingHours.close.split(":").map(Number);
  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  if (openMinutes <= closeMinutes) {
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }

  return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
};

const formatDistance = (distanceKm) => {
  if (distanceKm === null) return "Allow location";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m away`;
  return `${distanceKm.toFixed(1)} km away`;
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const UserHome = () => {
  const [slots, setSlots] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [bookingDialog, setBookingDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [chargePercentage, setChargePercentage] = useState(80);
  const [chargerType, setChargerType] = useState("AC");
  const [userLocation, setUserLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [activeBooking, setActiveBooking] = useState(null);
  const [rates, setRates] = useState(null);
  const userName = localStorage.getItem("name") || "User";
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const fetchAvailableSlots = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get("/slots/available");
      setSlots(response.data);
    } catch (err) {
      setError("Failed to load slots");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChargingStations = useCallback(async () => {
    try {
      const response = await API.get("/charging/stations");
      setStations(response.data);
    } catch (err) {
      console.log("Failed to load charging stations");
    }
  }, []);

  const fetchActiveBooking = useCallback(async () => {
    try {
      const response = await API.get("/bookings/user/bookings");
      const active = response.data.find(b => b.status === "active");
      setActiveBooking(active || null);
    } catch (err) {
      console.log("Failed to load active booking");
    }
  }, []);

  const fetchRates = useCallback(async () => {
    try {
      const response = await API.get("/charging/rates");
      setRates(response.data);
    } catch (err) {
      console.log("Failed to load charging rates");
    }
  }, []);

  useEffect(() => {
    fetchAvailableSlots();
    fetchChargingStations();
    fetchActiveBooking();
    fetchRates();
  }, [fetchAvailableSlots, fetchChargingStations, fetchActiveBooking, fetchRates]);

  // Real-time socket listeners
  useEffect(() => {
    const handleSlotUpdated = () => {
      fetchAvailableSlots();
    };

    const handleBookingCreated = () => {
      fetchAvailableSlots();
      fetchActiveBooking();
    };

    const handleBookingEnded = () => {
      fetchAvailableSlots();
      fetchActiveBooking();
    };

    socket.on("slot-updated", handleSlotUpdated);
    socket.on("booking-created", handleBookingCreated);
    socket.on("booking-ended", handleBookingEnded);

    return () => {
      socket.off("slot-updated", handleSlotUpdated);
      socket.off("booking-created", handleBookingCreated);
      socket.off("booking-ended", handleBookingEnded);
    };
  }, [fetchAvailableSlots, fetchActiveBooking]);

  // Geolocation for charging station distances
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationMessage("Location is not supported on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationMessage("");
      },
      () => {
        setLocationMessage("Enable location to see how far each charging station is.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const handleBookSlot = (slotId) => {
    setSelectedSlot(slotId);
    setBookingDialog(true);
  };

  const confirmBooking = async () => {
    try {
      setLoading(true);
      await API.post("/bookings", {
        slotId: selectedSlot,
        batteryChargedPercentage: Number(chargePercentage) || 0,
        chargerType,
      });
      setSuccessMessage("Slot booked successfully!");
      setBookingDialog(false);
      fetchActiveBooking();
      setTimeout(() => {
        setSuccessMessage("");
        fetchAvailableSlots();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStartCharging = async () => {
    try {
      setLoading(true);
      await API.put(`/bookings/${activeBooking._id}/start-charging`);
      setSuccessMessage("Charging started!");
      fetchActiveBooking();
      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
    } catch (err) {
      setError("Failed to start charging");
    } finally {
      setLoading(false);
    }
  };

  const handleEndBooking = async () => {
    try {
      setLoading(true);
      await API.put(`/bookings/${activeBooking._id}/end`, {});
      setSuccessMessage("Booking ended successfully!");
      setActiveBooking(null);
      fetchAvailableSlots();
      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
    } catch (err) {
      setError("Failed to end booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} className="ev-page">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ color: "primary.main", fontWeight: 700, fontSize: "0.85rem", mb: 0.5 }}>
          {getGreeting()}, {userName.split(" ")[0]} 👋
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            mb: 1,
            fontSize: { xs: "1.5rem", sm: "1.8rem" },
          }}
        >
          Find & Book Your Spot
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
          Browse available parking slots and nearby charging stations.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2.5 }}>
          {successMessage}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ mb: 4, display: "flex" }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          TabIndicatorProps={{ style: { display: "none" } }}
          sx={{
            minHeight: "unset",
            p: 0.75,
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
            "& .MuiTab-root": {
              minHeight: 44,
              py: 1,
              px: 3.5,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.95rem",
              color: "text.secondary",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              gap: 1,
              "&:hover": {
                color: "text.primary",
              },
              "&.Mui-selected": {
                color: "#fff",
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                boxShadow: "0 4px 12px rgba(34, 197, 94, 0.35)",
              },
            },
          }}
        >
          <Tab
            icon={<LocalParkingIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="Available Slots"
            disableRipple
          />
          <Tab
            icon={<EvStationIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="Charging Stations"
            disableRipple
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {activeBooking && !loading && (
          <Box sx={{ animation: "ev-slideUp 400ms ease-out both" }}>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2.5 }}>
              You have an active booking. You cannot book another slot until this one is completed.
            </Alert>
            <LiveChargingWidget 
              activeBooking={activeBooking} 
              rates={rates} 
              onStartCharging={handleStartCharging}
              onEndSession={handleEndBooking} 
              loading={loading} 
            />
          </Box>
        )}

        {!activeBooking && slots.length === 0 && !loading && (
          <Alert severity="info" sx={{ borderRadius: 2.5 }}>
            No available slots at the moment
          </Alert>
        )}
        
        {!activeBooking && (
          <Grid container spacing={2.5}>
            {slots.map((slot, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={slot._id}
                sx={{ animation: `ev-slideUp 400ms ease-out ${index * 80}ms both` }}
              >
                <SlotCard slot={slot} onBook={handleBookSlot} />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {locationMessage && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2.5 }}>
            {locationMessage}
          </Alert>
        )}
        {stations.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2.5 }}>
            No charging stations available
          </Alert>
        ) : (
          <Grid container spacing={2.5}>
            {stations.map((station, index) => {
              const distance = calculateDistance(userLocation, station.location);
              const open = isStationOpen(station.operatingHours);

              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={4}
                  key={station._id}
                  sx={{ animation: `ev-slideUp 400ms ease-out ${index * 80}ms both` }}
                >
                  <Card className="ev-premium-card" sx={{ height: "100%" }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2.5 }}>
                        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                          <Avatar
                            sx={{
                              width: 44,
                              height: 44,
                              bgcolor: "rgba(16, 185, 129, 0.1)",
                              color: "#10b981",
                            }}
                          >
                            <ElectricBoltIcon sx={{ fontSize: 22 }} />
                          </Avatar>
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 800,
                                fontFamily: "'Outfit', sans-serif",
                                fontSize: "1rem",
                              }}
                            >
                              {station.stationName}
                            </Typography>
                            <Typography
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                color: "text.secondary",
                                fontSize: "0.8rem",
                              }}
                            >
                              <NearMeIcon sx={{ fontSize: 14 }} />
                              {formatDistance(distance)}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={open === null ? "Hours N/A" : open ? "Open" : "Closed"}
                          color={open === null ? "default" : open ? "success" : "error"}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 700, borderRadius: 2 }}
                        />
                      </Box>

                      <Box
                        sx={{
                          display: "grid",
                          gap: 1.5,
                          p: 2,
                          borderRadius: 2.5,
                          bgcolor: "background.default",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          color="text.secondary"
                          sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: "0.85rem" }}
                        >
                          <MapIcon sx={{ fontSize: 16, color: "primary.main" }} />
                          {station.location?.address || "Address not available"}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: "0.85rem" }}
                        >
                          <AccessTimeIcon sx={{ fontSize: 16, color: "#f59e0b" }} />
                          {station.operatingHours?.open && station.operatingHours?.close
                            ? `${station.operatingHours.open} - ${station.operatingHours.close}`
                            : "Operating hours not available"}
                        </Typography>
                        <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                          Charger Type: <strong>{station.chargerType}</strong>
                        </Typography>
                        <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                          Available: <strong>{station.availableChargers}/{station.totalChargers}</strong> chargers
                        </Typography>
                      </Box>

                      <Button
                        startIcon={<DirectionsIcon />}
                        variant="outlined"
                        size="small"
                        sx={{ mt: 2.5, borderRadius: 2 }}
                        fullWidth
                        disabled={!station.location?.lat || !station.location?.lng}
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${station.location.lat},${station.location.lng}`, "_blank")}
                      >
                        Get Directions
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </TabPanel>

      {/* Booking Confirmation Dialog */}
      <Dialog
        open={bookingDialog}
        onClose={() => setBookingDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontFamily: "'Outfit', sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: "rgba(16, 185, 129, 0.1)",
              color: "#10b981",
            }}
          >
            <BatteryChargingFullIcon sx={{ fontSize: 22 }} />
          </Avatar>
          Confirm Booking
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 3, color: "text.secondary" }}>
            Set your desired battery charge level for this session.
          </Typography>
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography sx={{ fontWeight: 700, mb: 1, fontSize: "0.9rem" }}>
              Battery Charge Target
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Slider
                value={chargePercentage}
                onChange={(e, newValue) => setChargePercentage(newValue)}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                sx={{
                  color: "#10b981",
                  "& .MuiSlider-thumb": {
                    width: 20,
                    height: 20,
                  },
                }}
              />
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  minWidth: 48,
                  textAlign: "right",
                  color: "#10b981",
                }}
              >
                {chargePercentage}%
              </Typography>
            </Box>

            <Typography sx={{ fontWeight: 700, mb: 1, mt: 3, fontSize: "0.9rem" }}>
              Charger Type
            </Typography>
            <Box sx={{ display: "grid", gap: 1 }}>
              {[
                { value: "AC", label: "AC Charger (7.4 kW)" },
                { value: "DC-Fast", label: "DC Fast (50 kW)" },
                { value: "Super-Fast", label: "Super Fast (150 kW)" },
              ].map((type) => (
                <Button
                  key={type.value}
                  variant={chargerType === type.value ? "contained" : "outlined"}
                  onClick={() => setChargerType(type.value)}
                  sx={{
                    justifyContent: "flex-start",
                    borderRadius: 2,
                    color: chargerType === type.value ? "#fff" : "text.primary",
                    borderColor: chargerType === type.value ? "transparent" : "divider",
                    bgcolor: chargerType === type.value ? "#10b981" : "transparent",
                    "&:hover": {
                      bgcolor: chargerType === type.value ? "#059669" : "rgba(16, 185, 129, 0.05)",
                      borderColor: chargerType === type.value ? "transparent" : "#10b981",
                    },
                  }}
                >
                  {type.label}
                </Button>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setBookingDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmBooking}
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
              },
            }}
          >
            ⚡ Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserHome;
