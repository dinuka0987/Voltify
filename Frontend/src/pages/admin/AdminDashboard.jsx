import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import PaidIcon from "@mui/icons-material/Paid";
import PersonIcon from "@mui/icons-material/Person";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import API from "../../services/api";
import socket from "../../socket";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const adminName = localStorage.getItem("name") || "Admin";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes] = await Promise.all([
        API.get("/admin/dashboard/stats"),
        API.get("/admin/bookings/recent"),
      ]);

      setStats(statsRes.data);
      setRecentBookings(bookingsRes.data);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Real-time socket listeners
  useEffect(() => {
    const handleUpdate = () => {
      fetchDashboardData();
    };

    socket.on("slot-updated", handleUpdate);
    socket.on("booking-created", handleUpdate);
    socket.on("booking-ended", handleUpdate);

    return () => {
      socket.off("slot-updated", handleUpdate);
      socket.off("booking-created", handleUpdate);
      socket.off("booking-ended", handleUpdate);
    };
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const chartData = stats
    ? [
        { name: "Available Slots", value: stats.availableSlots },
        { name: "Occupied Slots", value: stats.occupiedSlots },
        { name: "Maintenance", value: Math.max(stats.totalSlots - stats.availableSlots - stats.occupiedSlots, 0) },
      ].filter((item) => item.value > 0)
    : [];

  const colors = ["#10b981", "#f43f5e", "#f59e0b"];

  const statCards = stats
    ? [
        {
          title: "Total Slots",
          value: stats.totalSlots,
          subtitle: "All parking slots",
          icon: DirectionsCarIcon,
          color: "#22c55e",
          gradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.03))",
          cssClass: "ev-stat-card--blue",
        },
        {
          title: "Available",
          value: stats.availableSlots,
          subtitle: "Currently available",
          icon: ElectricBoltIcon,
          color: "#10b981",
          gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.03))",
          cssClass: "ev-stat-card--green",
        },
        {
          title: "Users",
          value: stats.totalUsers,
          subtitle: "Registered users",
          icon: PersonIcon,
          color: "#f59e0b",
          gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.03))",
          cssClass: "ev-stat-card--amber",
        },
        {
          title: "Revenue",
          value: `$${Number(stats.totalRevenue || 0).toFixed(2)}`,
          subtitle: "Total earnings",
          icon: PaidIcon,
          color: "#2563eb",
          gradient: "linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(37, 99, 235, 0.03))",
          cssClass: "ev-stat-card--purple",
        },
      ]
    : [];

  const MetricRow = ({ icon: Icon, label, value, color }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: `${color}14`,
          color: color,
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
      </Avatar>
      <Typography sx={{ flexGrow: 1, color: "text.secondary", fontWeight: 600, fontSize: "0.9rem" }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontWeight: 800,
          color: "text.primary",
          fontFamily: "'Outfit', sans-serif",
          fontSize: "1.1rem",
        }}
      >
        {value}
      </Typography>
    </Box>
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            p: 1.5,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
            {payload[0].name}: {payload[0].value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }} className="ev-page">
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography sx={{ color: "primary.main", fontWeight: 700, fontSize: "0.85rem", mb: 0.5 }}>
            {getGreeting()}, {adminName.split(" ")[0]} 👋
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              color: "text.primary",
              fontSize: { xs: "1.5rem", sm: "1.8rem" },
            }}
          >
            Admin Dashboard
          </Typography>
        </Box>
        <Chip
          icon={<CalendarMonthIcon sx={{ fontSize: 16 }} />}
          label={new Date().toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
          sx={{
            px: 1,
            py: 2.5,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            fontWeight: 700,
            borderRadius: 2.5,
            fontSize: "0.8rem",
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }}>
          {error}
        </Alert>
      )}

      {stats && (
        <>
          {/* Stat Cards */}
          <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
            {statCards.map((card, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                lg={3}
                key={card.title}
                sx={{ animation: `ev-slideUp 400ms ease-out ${index * 80}ms both` }}
              >
                <Card className={`ev-stat-card ${card.cssClass}`}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography
                          sx={{
                            color: "text.secondary",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            mb: 1,
                          }}
                        >
                          {card.title}
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 900,
                            color: "text.primary",
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: { xs: "1.5rem", sm: "1.8rem" },
                          }}
                        >
                          {card.value}
                        </Typography>
                        <Typography sx={{ color: "text.secondary", mt: 0.5, fontSize: "0.8rem" }}>
                          {card.subtitle}
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          background: card.gradient,
                          color: card.color,
                        }}
                      >
                        <card.icon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Charts & Metrics */}
          <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
            <Grid item xs={12} md={6} sx={{ animation: "ev-slideUp 400ms ease-out 350ms both" }}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: 800,
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "1.05rem",
                    }}
                  >
                    Slot Distribution
                  </Typography>
                  {chartData.length > 0 ? (
                    <Box sx={{ position: "relative" }}>
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={95}
                            dataKey="value"
                            stroke="none"
                            paddingAngle={3}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={entry.name} fill={colors[index % colors.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Legend */}
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 1 }}>
                        {chartData.map((entry, index) => (
                          <Box key={entry.name} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: colors[index % colors.length],
                              }}
                            />
                            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", fontWeight: 600 }}>
                              {entry.name}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ) : (
                    <Typography sx={{ color: "text.secondary", textAlign: "center", py: 4 }}>
                      No slot data available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} sx={{ animation: "ev-slideUp 400ms ease-out 450ms both" }}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 1,
                      fontWeight: 800,
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "1.05rem",
                    }}
                  >
                    Key Metrics
                  </Typography>
                  <MetricRow
                    icon={TrendingUpIcon}
                    label="Occupancy Rate"
                    value={`${stats.occupancyRate}%`}
                    color="#22c55e"
                  />
                  <MetricRow
                    icon={LocalParkingIcon}
                    label="Active Bookings"
                    value={stats.activeBookings}
                    color="#f59e0b"
                  />
                  <MetricRow
                    icon={CheckCircleIcon}
                    label="Completed Bookings"
                    value={stats.completedBookings}
                    color="#10b981"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Bookings Table */}
          <Card sx={{ animation: "ev-slideUp 400ms ease-out 550ms both" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2.5,
                  fontWeight: 800,
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "1.05rem",
                }}
              >
                Recent Bookings
              </Typography>
              <TableContainer sx={{ borderRadius: 2, overflow: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Slot</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentBookings.map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: "rgba(34, 197, 94, 0.1)",
                                color: "#22c55e",
                                fontSize: 13,
                                fontWeight: 700,
                              }}
                            >
                              {(booking.userId?.name || "U").charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                              {booking.userId?.name || "Unknown"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                            {booking.slotId?.slotNumber || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: "0.85rem" }}>
                            {new Date(booking.startTime).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={booking.status}
                            variant="outlined"
                            sx={{
                              fontWeight: 700,
                              borderRadius: 2,
                              textTransform: "capitalize",
                              ...(booking.status === "active"
                                ? { bgcolor: "rgba(34, 197, 94, 0.1)", color: "#22c55e", borderColor: "rgba(34, 197, 94, 0.2)" }
                                : { bgcolor: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.2)" }),
                              border: "1px solid",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 800, color: "#10b981", fontSize: "0.9rem" }}>
                            ${Number(booking.totalCost || 0).toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;
