import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import Battery20Icon from "@mui/icons-material/Battery20";
import Battery50Icon from "@mui/icons-material/Battery50";
import Battery80Icon from "@mui/icons-material/Battery80";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import EvStationIcon from "@mui/icons-material/EvStation";
import PaidIcon from "@mui/icons-material/Paid";
import SpeedIcon from "@mui/icons-material/Speed";
import CalculateIcon from "@mui/icons-material/Calculate";
import HistoryIcon from "@mui/icons-material/History";
import StopCircleIcon from "@mui/icons-material/StopCircle";
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
  MenuItem,
  Paper,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import API from "../../services/api";
import socket from "../../socket";

const CHARGER_TYPES = [
  {
    value: "AC",
    label: "AC Charger",
    power: 7.4,
    description: "Standard charging · 7.4 kW",
    color: "#22c55e",
    timeLabel: "6-8 hours for full charge",
  },
  {
    value: "DC-Fast",
    label: "DC Fast Charger",
    power: 50,
    description: "Fast charging · 50 kW",
    color: "#f59e0b",
    timeLabel: "1-2 hours for full charge",
  },
  {
    value: "Super-Fast",
    label: "Super Fast Charger",
    power: 150,
    description: "Ultra rapid · 150 kW",
    color: "#10b981",
    timeLabel: "20-30 min for full charge",
  },
];

const BATTERY_CAPACITY = 60; // kWh (standard EV)

const getBatteryIcon = (percentage) => {
  if (percentage >= 90) return <BatteryFullIcon />;
  if (percentage >= 60) return <Battery80Icon />;
  if (percentage >= 30) return <Battery50Icon />;
  return <Battery20Icon />;
};

const getBatteryColor = (percentage) => {
  if (percentage >= 80) return "#10b981";
  if (percentage >= 50) return "#f59e0b";
  if (percentage >= 20) return "#f97316";
  return "#f43f5e";
};

const ChargingSession = () => {
  const [activeBooking, setActiveBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [endDialog, setEndDialog] = useState(false);

  // Estimator state
  const [estChargerType, setEstChargerType] = useState("AC");
  const [estCurrentBattery, setEstCurrentBattery] = useState(20);
  const [estTargetBattery, setEstTargetBattery] = useState(80);
  const [estimateResult, setEstimateResult] = useState(null);

  // Live charging simulation state
  const [livePercentage, setLivePercentage] = useState(0);
  const [liveEnergyConsumed, setLiveEnergyConsumed] = useState(0);
  const [liveEstTimeRemaining, setLiveEstTimeRemaining] = useState("");
  const [liveCost, setLiveCost] = useState(0);

  const [rates, setRates] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [bookingsRes, ratesRes] = await Promise.all([
        API.get("/bookings/user/bookings"),
        API.get("/charging/rates"),
      ]);

      const active = bookingsRes.data.find((b) => b.status === "active");

      setActiveBooking(active || null);
      setBookings(bookingsRes.data);
      setRates(ratesRes.data);
    } catch (err) {
      setError("Failed to load charging data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time socket listeners
  useEffect(() => {
    const handleUpdate = () => {
      fetchData();
    };

    socket.on("booking-created", handleUpdate);
    socket.on("booking-ended", handleUpdate);

    return () => {
      socket.off("booking-created", handleUpdate);
      socket.off("booking-ended", handleUpdate);
    };
  }, [fetchData]);

  // Live charging simulation — updates every second
  useEffect(() => {
    if (!activeBooking) {
      setLivePercentage(0);
      setLiveEnergyConsumed(0);
      setLiveEstTimeRemaining("");
      setLiveCost(0);
      return;
    }

    const chargerInfo = CHARGER_TYPES.find(
      (c) => c.value === activeBooking.chargerType
    ) || CHARGER_TYPES[0];

    const initialPercentage = activeBooking.batteryChargedPercentage || 0;
    const chargingRatePerKWh = rates?.chargingRatePerKWh || 0.25;

    const updateLive = () => {
      const now = new Date();
      const startTime = new Date(activeBooking.startTime);
      const elapsedHours = (now - startTime) / (1000 * 60 * 60);

      // Energy consumed so far
      const energy = Number((chargerInfo.power * elapsedHours).toFixed(2));
      setLiveEnergyConsumed(energy);

      // Current battery percentage
      const percentageGained = (energy / BATTERY_CAPACITY) * 100;
      const currentPercentage = Math.min(
        initialPercentage + percentageGained,
        100
      );
      setLivePercentage(Number(currentPercentage.toFixed(1)));

      // Estimated time to reach 100%
      const remainingEnergy =
        ((100 - currentPercentage) / 100) * BATTERY_CAPACITY;
      const remainingHours = remainingEnergy / chargerInfo.power;
      const remainingMinutes = Math.ceil(remainingHours * 60);

      if (currentPercentage >= 100) {
        setLiveEstTimeRemaining("Fully charged!");
      } else {
        const hrs = Math.floor(remainingMinutes / 60);
        const mins = remainingMinutes % 60;
        setLiveEstTimeRemaining(
          hrs > 0 ? `${hrs}h ${mins}m remaining` : `${mins}m remaining`
        );
      }

      // Live cost
      const cost = energy * chargingRatePerKWh;
      setLiveCost(Number(cost.toFixed(2)));
    };

    updateLive();
    const interval = setInterval(updateLive, 1000);

    return () => clearInterval(interval);
  }, [activeBooking, rates]);

  const handleEndBooking = async () => {
    try {
      setLoading(true);
      await API.put(`/bookings/${activeBooking._id}/end`, {});
      setSuccessMessage("Charging session ended successfully!");
      setEndDialog(false);
      fetchData();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to end session");
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimate = () => {
    const chargerInfo = CHARGER_TYPES.find((c) => c.value === estChargerType);
    if (!chargerInfo) return;

    const percentageDiff = estTargetBattery - estCurrentBattery;
    if (percentageDiff <= 0) {
      setEstimateResult({
        error: "Target battery must be higher than current battery",
      });
      return;
    }

    const energyNeeded = (percentageDiff / 100) * BATTERY_CAPACITY;
    const timeHours = energyNeeded / chargerInfo.power;
    const timeMinutes = Math.ceil(timeHours * 60);
    const chargingRatePerKWh = rates?.chargingRatePerKWh || 0.25;
    const cost = energyNeeded * chargingRatePerKWh;

    setEstimateResult({
      energy: energyNeeded.toFixed(2),
      timeMinutes,
      timeFormatted:
        timeMinutes >= 60
          ? `${Math.floor(timeMinutes / 60)}h ${timeMinutes % 60}m`
          : `${timeMinutes}m`,
      cost: cost.toFixed(2),
      chargerType: chargerInfo.label,
      power: chargerInfo.power,
    });
  };

  if (loading && !activeBooking && bookings.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} className="ev-page">
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: "rgba(16, 185, 129, 0.1)",
            color: "#10b981",
          }}
        >
          <EvStationIcon sx={{ fontSize: 24 }} />
        </Avatar>
        <Box>
          <Typography
            sx={{
              color: "#10b981",
              fontWeight: 700,
              fontSize: "0.85rem",
            }}
          >
            EV Charging
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: { xs: "1.4rem", sm: "1.7rem" },
            }}
          >
            Charging History
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2.5 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2.5 }}>
          {successMessage}
        </Alert>
      )}



      {/* ─── CHARGING SESSION HISTORY ─── */}
      <Card sx={{ animation: "ev-slideUp 400ms ease-out 200ms both" }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 3,
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: "rgba(139, 92, 246, 0.1)",
                color: "#8b5cf6",
              }}
            >
              <HistoryIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "1.05rem",
                }}
              >
                Past Sessions
              </Typography>
              <Chip
                label={bookings.length}
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

          {bookings.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2.5 }}>
              No charging sessions yet.
            </Alert>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "none",
                overflow: "auto",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Slot</TableCell>
                    <TableCell>Charger</TableCell>
                    <TableCell>Start Time</TableCell>
                    <TableCell>End Time</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Energy Used</TableCell>
                    <TableCell>Parking</TableCell>
                    <TableCell>Charging</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => {
                    const statusStyle = {
                      active: { bgcolor: "rgba(34, 197, 94, 0.1)", color: "#22c55e", borderColor: "rgba(34, 197, 94, 0.2)" },
                      completed: { bgcolor: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.2)" },
                      cancelled: { bgcolor: "rgba(244, 63, 94, 0.1)", color: "#f43f5e", borderColor: "rgba(244, 63, 94, 0.2)" },
                    }[booking.status] || { bgcolor: "rgba(244, 63, 94, 0.1)", color: "#f43f5e", borderColor: "rgba(244, 63, 94, 0.2)" };

                    return (
                    <TableRow key={booking._id}>
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontFamily: "'Outfit', sans-serif",
                          }}
                        >
                          {booking.slotId?.slotNumber || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={booking.chargerType || "AC"}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            borderRadius: 2,
                            bgcolor:
                              booking.chargerType === "Super-Fast"
                                ? "rgba(16, 185, 129, 0.1)"
                                : booking.chargerType === "DC-Fast"
                                ? "rgba(245, 158, 11, 0.1)"
                                : "rgba(34, 197, 94, 0.1)",
                            color:
                              booking.chargerType === "Super-Fast"
                                ? "#10b981"
                                : booking.chargerType === "DC-Fast"
                                ? "#f59e0b"
                                : "#22c55e",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "0.85rem" }}>
                          {new Date(
                            booking.startTime
                          ).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "0.85rem" }}>
                          {booking.endTime
                            ? new Date(
                                booking.endTime
                              ).toLocaleString()
                            : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        >
                          {booking.duration
                            ? `${Math.floor(booking.duration / 60)}h ${
                                booking.duration % 60
                              }m`
                            : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "#f59e0b",
                            fontSize: "0.9rem",
                          }}
                        >
                          {booking.energyConsumed
                            ? `${booking.energyConsumed} kWh`
                            : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "0.85rem" }}>
                          ${booking.parkingCost?.toFixed(2) || "0.00"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "0.85rem" }}>
                          ${booking.chargingCost?.toFixed(2) || "0.00"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            color: "#10b981",
                            fontSize: "0.9rem",
                          }}
                        >
                          ${Number(booking.totalCost || 0).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 700,
                            borderRadius: 2,
                            textTransform: "capitalize",
                            ...statusStyle,
                            border: "1px solid",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {booking.status === "active" && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => {
                              setActiveBooking(booking);
                              setEndDialog(true);
                            }}
                            sx={{ borderRadius: 2, fontSize: "0.75rem" }}
                          >
                            End
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* End Charging Dialog */}
      <Dialog
        open={endDialog}
        onClose={() => setEndDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Stop Charging?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "text.secondary" }}>
            Are you sure you want to stop the charging session? The final
            cost will be calculated based on energy consumed.
          </Typography>
          {activeBooking && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2.5,
                bgcolor: "background.default",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                sx={{ fontSize: "0.85rem", color: "text.secondary" }}
              >
                Current Battery:{" "}
                <strong style={{ color: getBatteryColor(livePercentage) }}>
                  {livePercentage}%
                </strong>
              </Typography>
              <Typography
                sx={{ fontSize: "0.85rem", color: "text.secondary" }}
              >
                Energy Consumed: <strong>{liveEnergyConsumed} kWh</strong>
              </Typography>
              <Typography
                sx={{ fontSize: "0.85rem", color: "text.secondary" }}
              >
                Estimated Cost:{" "}
                <strong style={{ color: "#10b981" }}>
                  ${liveCost}
                </strong>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setEndDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Continue Charging
          </Button>
          <Button
            onClick={handleEndBooking}
            variant="contained"
            color="error"
            disabled={loading}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #f43f5e, #e11d48)",
              "&:hover": {
                background: "linear-gradient(135deg, #fb7185, #f43f5e)",
              },
            }}
          >
            Stop & Calculate
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ChargingSession;
