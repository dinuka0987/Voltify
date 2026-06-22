import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import PersonIcon from "@mui/icons-material/Person";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import AssessmentIcon from "@mui/icons-material/Assessment";
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
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import API from "../../services/api";
import socket from "../../socket";

const Detail = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 800, overflowWrap: "anywhere" }}>
      {value || "-"}
    </Typography>
  </Box>
);

const AdminReports = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get("/bookings");
      setBookings(response.data);
    } catch (err) {
      setError("Failed to load charging user reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Real-time socket listeners
  useEffect(() => {
    const handleUpdate = () => {
      fetchReports();
    };

    socket.on("booking-created", handleUpdate);
    socket.on("booking-ended", handleUpdate);

    return () => {
      socket.off("booking-created", handleUpdate);
      socket.off("booking-ended", handleUpdate);
    };
  }, [fetchReports]);

  if (loading && bookings.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }} className="ev-page">
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: "rgba(34, 197, 94, 0.1)",
            color: "#22c55e",
          }}
        >
          <AssessmentIcon sx={{ fontSize: 24 }} />
        </Avatar>
        <Box>
          <Typography
            sx={{ color: "primary.main", fontWeight: 700, fontSize: "0.85rem" }}
          >
            Admin reports
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: { xs: "1.4rem", sm: "1.7rem" },
            }}
          >
            Charging User Details
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

      {!loading && bookings.length === 0 && (
        <Alert severity="info" sx={{ borderRadius: 2.5 }}>
          No booking details available yet.
        </Alert>
      )}

      <Grid container spacing={2.5}>
        {bookings.map((booking, index) => (
          <Grid
            item
            xs={12}
            lg={6}
            key={booking._id}
            sx={{
              animation: `ev-slideUp 400ms ease-out ${index * 60}ms both`,
            }}
          >
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: { xs: 3, md: 3.5 } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{ display: "flex", gap: 1.5, alignItems: "center" }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "rgba(34, 197, 94, 0.1)",
                        color: "#22c55e",
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>
                        {booking.userId?.name || "Unknown User"}
                      </Typography>
                      <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                        {booking.userId?.email || "No email"}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={booking.status}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 700,
                      borderRadius: 2,
                      textTransform: "capitalize",
                      ...(booking.status === "active"
                        ? {
                            bgcolor: "rgba(34, 197, 94, 0.1)",
                            color: "#22c55e",
                            borderColor: "rgba(34, 197, 94, 0.2)",
                          }
                        : {
                            bgcolor: "rgba(16, 185, 129, 0.1)",
                            color: "#10b981",
                            borderColor: "rgba(16, 185, 129, 0.2)",
                          }),
                      border: "1px solid",
                    }}
                  />
                </Box>

                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1.5,
                          alignItems: "center",
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: "background.default",
                            color: "primary.main",
                          }}
                        >
                          <TimeToLeaveIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography sx={{ fontWeight: 800, fontSize: "0.9rem" }}>
                          Vehicle Details
                        </Typography>
                      </Box>
                      <Detail
                        label="Vehicle Number"
                        value={booking.userId?.vehicleNumber}
                      />
                      <Detail
                        label="Vehicle Type"
                        value={
                          booking.userId?.vehicleType ||
                          booking.slotId?.vehicleType ||
                          "Any"
                        }
                      />
                      <Detail label="Phone" value={booking.userId?.phone} />
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1.5,
                          alignItems: "center",
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: "background.default",
                            color: "#10b981",
                          }}
                        >
                          <ElectricBoltIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography sx={{ fontWeight: 800, fontSize: "0.9rem" }}>
                          Charging Details
                        </Typography>
                      </Box>
                      <Detail
                        label="Slot"
                        value={booking.slotId?.slotNumber}
                      />
                      <Detail
                        label="Charging Power"
                        value={
                          booking.slotId?.chargingPower
                            ? `${booking.slotId.chargingPower} kW`
                            : "-"
                        }
                      />
                      <Detail
                        label="Battery Charged"
                        value={`${booking.batteryChargedPercentage || 0}%`}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(3, 1fr)",
                        },
                        gap: 2,
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: "background.default",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Detail
                        label="Start Time"
                        value={new Date(booking.startTime).toLocaleString()}
                      />
                      <Detail
                        label="Charging Cost"
                        value={`$${Number(
                          booking.chargingCost || 0
                        ).toFixed(2)}`}
                      />
                      <Detail
                        label="Total Cost"
                        value={`$${Number(booking.totalCost || 0).toFixed(2)}`}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminReports;
