import MonitorIcon from "@mui/icons-material/Monitor";
import FilterListIcon from "@mui/icons-material/FilterList";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SpeedIcon from "@mui/icons-material/Speed";
import PaidIcon from "@mui/icons-material/Paid";
import {
    Alert,
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Grid,
    LinearProgress,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import API from "../../services/api";
import socket from "../../socket";
import React from "react";

const CHARGER_TYPES = [
  { value: "AC", power: 7.4 },
  { value: "DC-Fast", power: 50 },
  { value: "Super-Fast", power: 150 },
];

const BATTERY_CAPACITY = 60; // kWh

const getBatteryColor = (percentage) => {
  if (percentage >= 80) return "#10b981";
  if (percentage >= 50) return "#f59e0b";
  if (percentage >= 20) return "#f97316";
  return "#f43f5e";
};

// Live charging card for a single active charging booking
const LiveChargingCard = ({ booking, rates }) => {
  const [livePercentage, setLivePercentage] = useState(0);
  const [liveEnergy, setLiveEnergy] = useState(0);
  const [liveCost, setLiveCost] = useState(0);
  const [sessionDuration, setSessionDuration] = useState("0m");

  useEffect(() => {
    if (!booking.isChargingStarted || !booking.chargingStartTime) return;

    const chargerInfo = CHARGER_TYPES.find(c => c.value === booking.chargerType) || CHARGER_TYPES[0];
    const initialPercentage = booking.batteryChargedPercentage || 0;
    const chargingRatePerKWh = rates?.chargingRatePerKWh || 0.25;

    const update = () => {
      const now = new Date();
      const start = new Date(booking.chargingStartTime);
      const elapsedHours = Math.max(0, (now - start) / (1000 * 60 * 60));
      const elapsedMins = Math.max(0, Math.floor((now - start) / 60000));

      const energy = Number((chargerInfo.power * elapsedHours).toFixed(2));
      setLiveEnergy(energy);

      const pctGained = (energy / BATTERY_CAPACITY) * 100;
      setLivePercentage(Number(Math.min(initialPercentage + pctGained, 100).toFixed(1)));

      const cost = energy * chargingRatePerKWh;
      setLiveCost(Number(cost.toFixed(2)));

      const hrs = Math.floor(elapsedMins / 60);
      const mins = elapsedMins % 60;
      setSessionDuration(hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`);
    };

    update();
    const interval = setInterval(update, 2000);
    return () => clearInterval(interval);
  }, [booking, rates]);

  const batteryColor = getBatteryColor(livePercentage);

  return (
    <Card
      sx={{
        height: "100%",
        borderLeft: `4px solid ${batteryColor}`,
        transition: "all 0.3s ease",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "rgba(34, 197, 94, 0.1)",
                color: "#22c55e",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {(booking.userId?.name || "U").charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.2 }}>
                {booking.userId?.name || "Unknown"}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                Slot {booking.slotId?.slotNumber || "-"}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={booking.chargerType || "AC"}
            size="small"
            sx={{
              fontWeight: 700,
              borderRadius: 2,
              bgcolor: "rgba(16, 185, 129, 0.1)",
              color: "#10b981",
              border: "1px solid rgba(16, 185, 129, 0.2)",
            }}
          />
        </Box>

        {/* Battery Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", fontWeight: 600 }}>
              Battery Level
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, color: batteryColor }}>
              {livePercentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={livePercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "divider",
              "& .MuiLinearProgress-bar": {
                bgcolor: batteryColor,
                borderRadius: 4,
                transition: "transform 1s ease",
              },
            }}
          />
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={1}>
          {[
            { icon: <ElectricBoltIcon />, label: "Energy", value: `${liveEnergy} kWh`, color: "#f59e0b" },
            { icon: <AccessTimeIcon />, label: "Duration", value: sessionDuration, color: "#3b82f6" },
            { icon: <PaidIcon />, label: "Cost", value: `$${liveCost}`, color: "#10b981" },
            { icon: <SpeedIcon />, label: "Power", value: `${CHARGER_TYPES.find(c => c.value === booking.chargerType)?.power || 7.4} kW`, color: "#8b5cf6" },
          ].map((stat) => (
            <Grid item xs={6} key={stat.label}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "background.default",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                  <Avatar sx={{ width: 22, height: 22, bgcolor: `${stat.color}18`, color: stat.color }}>
                    {React.cloneElement(stat.icon, { sx: { fontSize: 12 } })}
                  </Avatar>
                  <Typography sx={{ fontSize: "0.65rem", color: "text.secondary", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    {stat.label}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", fontSize: "1rem" }}>
                  {stat.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Footer Info */}
        <Box sx={{ mt: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 0.5 }}>
          <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
            Started: <strong>{new Date(booking.chargingStartTime).toLocaleTimeString()}</strong>
          </Typography>
          <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
            Initial: <strong>{booking.batteryChargedPercentage || 0}%</strong>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Booked (waiting) card
const BookedCard = ({ booking }) => {
  const [waitTime, setWaitTime] = useState("0m");

  useEffect(() => {
    const update = () => {
      const mins = Math.max(0, Math.floor((new Date() - new Date(booking.startTime)) / 60000));
      const hrs = Math.floor(mins / 60);
      const m = mins % 60;
      setWaitTime(hrs > 0 ? `${hrs}h ${m}m` : `${m}m`);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [booking]);

  return (
    <Card
      sx={{
        height: "100%",
        borderLeft: "4px solid #f59e0b",
        transition: "all 0.3s ease",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "rgba(245, 158, 11, 0.1)",
                color: "#f59e0b",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {(booking.userId?.name || "U").charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.2 }}>
                {booking.userId?.name || "Unknown"}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                Slot {booking.slotId?.slotNumber || "-"}
              </Typography>
            </Box>
          </Box>
          <Chip
            label="Waiting"
            size="small"
            sx={{
              fontWeight: 700,
              borderRadius: 2,
              bgcolor: "rgba(245, 158, 11, 0.1)",
              color: "#f59e0b",
              border: "1px solid rgba(245, 158, 11, 0.2)",
            }}
          />
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 2.5,
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          <LocalParkingIcon sx={{ fontSize: 36, color: "#f59e0b", mb: 1 }} />
          <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", mb: 0.5 }}>
            Waiting to Plug In
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
            Booked at {new Date(booking.startTime).toLocaleTimeString()}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mt: 0.5 }}>
            Waiting for <strong>{waitTime}</strong>
          </Typography>
          {booking.chargerType && (
            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mt: 0.5 }}>
              Charger: <strong>{booking.chargerType}</strong>
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const BookingMonitor = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rates, setRates] = useState(null);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter((b) => b.status === statusFilter));
    }
  }, [statusFilter, bookings]);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get("/bookings");
      setBookings(response.data);
    } catch (err) {
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRates = useCallback(async () => {
    try {
      const response = await API.get("/charging/rates");
      setRates(response.data);
    } catch (err) {
      console.log("Failed to load rates");
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchRates();
  }, [fetchBookings, fetchRates]);

  // Real-time socket listeners
  useEffect(() => {
    const handleUpdate = () => {
      fetchBookings();
    };

    socket.on("booking-created", handleUpdate);
    socket.on("booking-ended", handleUpdate);
    socket.on("booking-updated", handleUpdate);

    return () => {
      socket.off("booking-created", handleUpdate);
      socket.off("booking-ended", handleUpdate);
      socket.off("booking-updated", handleUpdate);
    };
  }, [fetchBookings]);

  // Separate active bookings into charging vs booked
  const activeBookings = bookings.filter(b => b.status === "active");
  const chargingVehicles = activeBookings.filter(b => b.isChargingStarted);
  const bookedVehicles = activeBookings.filter(b => !b.isChargingStarted);

  const getStatusStyle = (status) => {
    if (status === "active")
      return {
        bgcolor: "rgba(34, 197, 94, 0.1)",
        color: "#22c55e",
        borderColor: "rgba(34, 197, 94, 0.2)",
      };
    if (status === "completed")
      return {
        bgcolor: "rgba(16, 185, 129, 0.1)",
        color: "#10b981",
        borderColor: "rgba(16, 185, 129, 0.2)",
      };
    return {
      bgcolor: "rgba(244, 63, 94, 0.1)",
      color: "#f43f5e",
      borderColor: "rgba(244, 63, 94, 0.2)",
    };
  };

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading && bookings.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} className="ev-page">
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: "rgba(37, 99, 235, 0.1)",
              color: "#2563eb",
            }}
          >
            <MonitorIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography sx={{ color: "secondary.main", fontWeight: 700, fontSize: "0.85rem" }}>
              Live monitor
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  fontSize: { xs: "1.4rem", sm: "1.7rem" },
                }}
              >
                Booking Monitor
              </Typography>
              <Chip
                label={filteredBookings.length}
                size="small"
                sx={{
                  fontWeight: 800,
                  bgcolor: "rgba(37, 99, 235, 0.1)",
                  color: "#2563eb",
                  minWidth: 32,
                }}
              />
            </Box>
          </Box>
        </Box>

        <TextField
          select
          label="Filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: <FilterListIcon sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />,
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">All Bookings</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </TextField>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* ===== LIVE CHARGING VEHICLES SECTION ===== */}
      {chargingVehicles.length > 0 && (
        <Box sx={{ mb: 4, animation: "ev-slideUp 400ms ease-out both" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Box
              className="ev-pulse"
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: "#10b981",
                boxShadow: "0 0 12px rgba(16, 185, 129, 0.5)",
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", fontSize: "1.1rem" }}>
              Charging Now
            </Typography>
            <Chip
              label={chargingVehicles.length}
              size="small"
              sx={{
                fontWeight: 800,
                bgcolor: "rgba(16, 185, 129, 0.1)",
                color: "#10b981",
                minWidth: 28,
              }}
            />
          </Box>
          <Grid container spacing={2.5}>
            {chargingVehicles.map((booking, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                lg={4}
                key={booking._id}
                sx={{ animation: `ev-slideUp 400ms ease-out ${index * 80}ms both` }}
              >
                <LiveChargingCard booking={booking} rates={rates} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ===== BOOKED (WAITING TO PLUG IN) SECTION ===== */}
      {bookedVehicles.length > 0 && (
        <Box sx={{ mb: 4, animation: "ev-slideUp 400ms ease-out 100ms both" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: "#f59e0b",
                boxShadow: "0 0 8px rgba(245, 158, 11, 0.4)",
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", fontSize: "1.1rem" }}>
              Booked – Waiting to Plug In
            </Typography>
            <Chip
              label={bookedVehicles.length}
              size="small"
              sx={{
                fontWeight: 800,
                bgcolor: "rgba(245, 158, 11, 0.1)",
                color: "#f59e0b",
                minWidth: 28,
              }}
            />
          </Box>
          <Grid container spacing={2.5}>
            {bookedVehicles.map((booking, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                lg={4}
                key={booking._id}
                sx={{ animation: `ev-slideUp 400ms ease-out ${index * 80}ms both` }}
              >
                <BookedCard booking={booking} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ===== ALL BOOKINGS TABLE ===== */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", fontSize: "1.1rem" }}>
          All Bookings
        </Typography>
        <Chip
          label={filteredBookings.length}
          size="small"
          sx={{
            fontWeight: 800,
            bgcolor: "rgba(37, 99, 235, 0.1)",
            color: "#2563eb",
            minWidth: 28,
          }}
        />
      </Box>

      {filteredBookings.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2.5 }}>No bookings found</Alert>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
            overflow: "auto",
            animation: "ev-slideUp 400ms ease-out 200ms both",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Slot</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Parking</TableCell>
                <TableCell>Charging</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.map((booking) => {
                const statusStyle = getStatusStyle(booking.status);
                const isCharging = booking.status === "active" && booking.isChargingStarted;
                const isBooked = booking.status === "active" && !booking.isChargingStarted;

                return (
                  <TableRow key={booking._id}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 30,
                            height: 30,
                            bgcolor: "rgba(34, 197, 94, 0.1)",
                            color: "#22c55e",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {(booking.userId?.name || "U").charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                          {booking.userId?.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                        {booking.slotId?.slotNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.85rem" }}>
                        {new Date(booking.startTime).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.85rem" }}>
                        {booking.endTime
                          ? new Date(booking.endTime).toLocaleString()
                          : "Ongoing"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                        {calculateDuration(booking.startTime, booking.endTime)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.85rem" }}>
                        ${booking.parkingCost?.toFixed(2) || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.85rem" }}>
                        ${booking.chargingCost?.toFixed(2) || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 800, color: "#10b981", fontSize: "0.9rem" }}>
                        ${booking.totalCost?.toFixed(2) || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          isCharging ? "Charging" : isBooked ? "Booked" : booking.status
                        }
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: 700,
                          borderRadius: 2,
                          textTransform: "capitalize",
                          ...(isCharging
                            ? {
                                bgcolor: "rgba(16, 185, 129, 0.1)",
                                color: "#10b981",
                                borderColor: "rgba(16, 185, 129, 0.3)",
                              }
                            : isBooked
                            ? {
                                bgcolor: "rgba(245, 158, 11, 0.1)",
                                color: "#f59e0b",
                                borderColor: "rgba(245, 158, 11, 0.3)",
                              }
                            : statusStyle),
                          border: "1px solid",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default BookingMonitor;
