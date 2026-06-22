import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import Battery20Icon from "@mui/icons-material/Battery20";
import Battery50Icon from "@mui/icons-material/Battery50";
import Battery80Icon from "@mui/icons-material/Battery80";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import PaidIcon from "@mui/icons-material/Paid";
import SpeedIcon from "@mui/icons-material/Speed";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import LocalParkingIcon from "@mui/icons-material/LocalParking";

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

const LiveChargingWidget = ({ activeBooking, rates, onStartCharging, onEndSession, loading }) => {
  const [livePercentage, setLivePercentage] = useState(0);
  const [liveEnergyConsumed, setLiveEnergyConsumed] = useState(0);
  const [liveEstTimeRemaining, setLiveEstTimeRemaining] = useState("");
  const [liveCost, setLiveCost] = useState(0);
  const [liveParkingCost, setLiveParkingCost] = useState(0);
  const [endDialog, setEndDialog] = useState(false);

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
    const parkingRatePerHour = rates?.parkingRatePerHour || 5;
    const minimumParkingCharge = rates?.minimumParkingCharge || 2;

    const updateLive = () => {
      if (!activeBooking.isChargingStarted) {
        setLivePercentage(initialPercentage);
        setLiveEnergyConsumed(0);
        setLiveEstTimeRemaining("Not charging");
        setLiveCost(0);
        setLiveParkingCost(0);
        return;
      }

      const now = new Date();
      const startTime = new Date(activeBooking.chargingStartTime || activeBooking.startTime);
      const elapsedHours = Math.max(0, (now - startTime) / (1000 * 60 * 60));

      const energy = Number((chargerInfo.power * elapsedHours).toFixed(2));
      setLiveEnergyConsumed(energy);

      const percentageGained = (energy / BATTERY_CAPACITY) * 100;
      const currentPercentage = Math.min(initialPercentage + percentageGained, 100);
      setLivePercentage(Number(currentPercentage.toFixed(1)));

      const remainingEnergy = ((100 - currentPercentage) / 100) * BATTERY_CAPACITY;
      const remainingHours = remainingEnergy / chargerInfo.power;
      const remainingMinutes = Math.ceil(remainingHours * 60);

      if (currentPercentage >= 100) {
        setLiveEstTimeRemaining("Fully charged!");
      } else {
        const hrs = Math.floor(remainingMinutes / 60);
        const mins = remainingMinutes % 60;
        setLiveEstTimeRemaining(hrs > 0 ? `${hrs}h ${mins}m remaining` : `${mins}m remaining`);
      }

      const cost = energy * chargingRatePerKWh;
      setLiveCost(Number(cost.toFixed(2)));

      // Calculate parking cost from booking start (not charging start)
      const parkingHours = Math.max(0, (now - new Date(activeBooking.startTime)) / (1000 * 60 * 60));
      const pCost = Math.max(parkingHours * parkingRatePerHour, minimumParkingCharge);
      setLiveParkingCost(Number(pCost.toFixed(2)));
    };

    updateLive();
    const interval = setInterval(updateLive, 1000);
    return () => clearInterval(interval);
  }, [activeBooking, rates]);

  if (!activeBooking) return null;

  if (!activeBooking.isChargingStarted) {
    return (
      <Card
        sx={{
          mb: 4,
          borderLeft: "4px solid #f59e0b",
          animation: "ev-slideUp 400ms ease-out both",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}>
          <Box sx={{ display: "inline-flex", p: 2, borderRadius: "50%", bgcolor: "rgba(245, 158, 11, 0.1)", mb: 2 }}>
            <ElectricBoltIcon sx={{ fontSize: 48, color: "#f59e0b" }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", mb: 1 }}>
            Ready to Charge
          </Typography>
          <Typography sx={{ color: "text.secondary", mb: 4, maxWidth: 400, mx: "auto" }}>
            You have successfully booked Slot {activeBooking.slotId?.slotNumber || "-"}. Please park your vehicle and plug in the charger to begin.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="outlined"
              color="error"
              onClick={onEndSession}
              disabled={loading}
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: 3,
                fontSize: "1rem",
              }}
            >
              Cancel Booking
            </Button>
            <Button
              variant="contained"
              onClick={onStartCharging}
              disabled={loading}
              startIcon={<BatteryChargingFullIcon />}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 3,
                fontSize: "1rem",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
                  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
                },
              }}
            >
              {loading ? "Starting..." : "Plug In & Start Charging"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        sx={{
          mb: 4,
          borderLeft: "4px solid #10b981",
          animation: "ev-slideUp 400ms ease-out both",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
              <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
                Live Charging
              </Typography>
              <Chip
                label={activeBooking.chargerType || "AC"}
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
            <Button
              variant="contained"
              color="error"
              startIcon={<StopCircleIcon />}
              onClick={() => setEndDialog(true)}
              disabled={loading}
              sx={{
                borderRadius: 2,
                background: "linear-gradient(135deg, #f43f5e, #e11d48)",
                "&:hover": {
                  background: "linear-gradient(135deg, #fb7185, #f43f5e)",
                },
              }}
            >
              Stop Charging
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Battery Visual */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 2 }}>
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <CircularProgress
                    variant="determinate"
                    value={livePercentage}
                    size={160}
                    thickness={5}
                    sx={{
                      color: getBatteryColor(livePercentage),
                      "& .MuiCircularProgress-circle": {
                        strokeLinecap: "round",
                        transition: "stroke-dashoffset 1s ease",
                      },
                    }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={160}
                    thickness={5}
                    sx={{
                      color: "divider",
                      position: "absolute",
                      left: 0,
                      opacity: 0.3,
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0, left: 0, bottom: 0, right: 0,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <BatteryChargingFullIcon
                      sx={{ fontSize: 28, color: getBatteryColor(livePercentage), mb: 0.5 }}
                    />
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "2rem",
                        lineHeight: 1,
                        color: getBatteryColor(livePercentage),
                      }}
                    >
                      {livePercentage}%
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ mt: 2, fontSize: "0.85rem", color: "text.secondary", fontWeight: 600 }}>
                  {liveEstTimeRemaining}
                </Typography>
              </Box>
            </Grid>

            {/* Charging Stats */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                {[
                  { icon: <ElectricBoltIcon />, label: "Energy Consumed", value: `${liveEnergyConsumed} kWh`, color: "#f59e0b" },
                  {
                    icon: <AccessTimeIcon />, label: "Session Duration", value: (() => {
                      const mins = Math.max(0, Math.floor((new Date() - new Date(activeBooking.chargingStartTime || activeBooking.startTime)) / 60000));
                      return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
                    })(), color: "#3b82f6"
                  },
                  { icon: <PaidIcon />, label: "Charging Cost", value: `$${liveCost}`, color: "#10b981" },
                  { icon: <LocalParkingIcon />, label: "Parking Cost", value: `$${liveParkingCost}`, color: "#f97316" },
                  {
                    icon: <SpeedIcon />, label: "Charger Power", value: `${CHARGER_TYPES.find((c) => c.value === activeBooking.chargerType)?.power || 7.4} kW`, color: "#8b5cf6"
                  },
                  { icon: <PaidIcon />, label: "Total Cost", value: `$${(liveCost + liveParkingCost).toFixed(2)}`, color: "#2563eb" },
                ].map((stat) => (
                  <Grid item xs={6} key={stat.label}>
                    <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: "background.default", border: "1px solid", borderColor: "divider", height: "100%" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: `${stat.color}18`, color: stat.color }}>
                          {React.cloneElement(stat.icon, { sx: { fontSize: 16 } })}
                        </Avatar>
                        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {stat.label}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 900, fontFamily: "'Outfit', sans-serif", fontSize: "1.3rem" }}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 2, p: 2, borderRadius: 2.5, bgcolor: "background.default", border: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                  Slot: <strong>{activeBooking.slotId?.slotNumber || "-"}</strong>
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                  Started: <strong>{new Date(activeBooking.startTime).toLocaleTimeString()}</strong>
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                  Initial Battery: <strong>{activeBooking.batteryChargedPercentage || 0}%</strong>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Dialog open={endDialog} onClose={() => setEndDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
          Stop Charging?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "text.secondary" }}>
            Are you sure you want to stop the charging session? The final cost will be calculated based on energy consumed.
          </Typography>
          <Box sx={{ mt: 2, p: 2, borderRadius: 2.5, bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}>
            <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
              Current Battery: <strong style={{ color: getBatteryColor(livePercentage) }}>{livePercentage}%</strong>
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
              Energy Consumed: <strong>{liveEnergyConsumed} kWh</strong>
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
              Charging Cost: <strong style={{ color: "#10b981" }}>${liveCost}</strong>
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
              Parking Cost: <strong style={{ color: "#f97316" }}>${liveParkingCost}</strong>
            </Typography>
            <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
              <Typography sx={{ fontSize: "0.95rem", fontWeight: 800 }}>
                Total: <strong style={{ color: "#2563eb" }}>${(liveCost + liveParkingCost).toFixed(2)}</strong>
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setEndDialog(false)} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setEndDialog(false);
              onEndSession();
            }}
            variant="contained"
            color="error"
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            Confirm Stop
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LiveChargingWidget;
