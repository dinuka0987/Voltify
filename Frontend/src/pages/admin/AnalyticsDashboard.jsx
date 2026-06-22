import React, { useState, useEffect, useCallback } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import API from "../../services/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState({ weekly: [], monthly: [], yearly: [] });
  const [heatmapData, setHeatmapData] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const [revRes, heatRes] = await Promise.all([
        API.get("/admin/analytics/revenue/advanced"),
        API.get("/admin/analytics/heatmap")
      ]);

      // Transform backend object data to Recharts array format
      const transformToChartData = (obj) => {
        return Object.keys(obj).sort().map(key => ({
          name: key,
          revenue: obj[key]
        }));
      };

      setRevenueData({
        weekly: transformToChartData(revRes.data.weekly),
        monthly: transformToChartData(revRes.data.monthly),
        yearly: transformToChartData(revRes.data.yearly),
      });

      setHeatmapData(heatRes.data.heatmap);
    } catch (err) {
      console.error("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const renderRevenueChart = (data) => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: "#64748b" }} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: "#64748b" }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
          formatter={(value) => [`$${value.toFixed(2)}`, "Revenue"]}
        />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#10b981" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorRev)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const getHeatmapColor = (value, max) => {
    if (value === 0) return "rgba(34, 197, 94, 0.05)";
    const intensity = Math.max(0.2, value / max);
    return `rgba(34, 197, 94, ${intensity})`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} className="ev-page">
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Avatar sx={{ width: 48, height: 48, bgcolor: "rgba(34, 197, 94, 0.1)", color: "#2563eb" }}>
          <AnalyticsIcon sx={{ fontSize: 24 }} />
        </Avatar>
        <Box>
          <Typography sx={{ color: "#2563eb", fontWeight: 700, fontSize: "0.85rem" }}>
            Reports
          </Typography>
          <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>
            Analytics Dashboard
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Revenue Analytics */}
          <Grid item xs={12}>
            <Card className="ev-premium-card" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", mb: 2 }}>
                  Revenue Trends
                </Typography>
                
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                  <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <Tab label="Weekly" />
                    <Tab label="Monthly" />
                    <Tab label="Yearly" />
                  </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                  {revenueData.weekly.length === 0 ? (
                    <Typography color="text.secondary">No data available yet.</Typography>
                  ) : renderRevenueChart(revenueData.weekly)}
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                  {revenueData.monthly.length === 0 ? (
                    <Typography color="text.secondary">No data available yet.</Typography>
                  ) : renderRevenueChart(revenueData.monthly)}
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                  {revenueData.yearly.length === 0 ? (
                    <Typography color="text.secondary">No data available yet.</Typography>
                  ) : renderRevenueChart(revenueData.yearly)}
                </TabPanel>
              </CardContent>
            </Card>
          </Grid>

          {/* Booking Heatmap */}
          <Grid item xs={12}>
            <Card className="ev-premium-card" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
                    Booking Peak Hours Heatmap
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                    Visualizing booking frequency by day of week and time of day. Darker blue indicates more bookings.
                  </Typography>
                </Box>

                <Box sx={{ overflowX: "auto" }}>
                  <Box sx={{ minWidth: 800 }}>
                    {/* Header: Hours */}
                    <Box sx={{ display: "flex", ml: 6, mb: 1 }}>
                      {Array.from({ length: 24 }).map((_, i) => (
                        <Typography key={`h-${i}`} sx={{ flex: 1, textAlign: "center", fontSize: "0.7rem", color: "text.secondary", fontWeight: 700 }}>
                          {i}h
                        </Typography>
                      ))}
                    </Box>

                    {/* Heatmap Grid */}
                    {heatmapData.length > 0 && heatmapData.map((dayData, dayIndex) => {
                      const maxVal = Math.max(...heatmapData.flat());
                      
                      return (
                        <Box key={`day-${dayIndex}`} sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                          <Typography sx={{ width: 48, fontSize: "0.8rem", fontWeight: 700, color: "text.secondary" }}>
                            {DAYS[dayIndex]}
                          </Typography>
                          <Box sx={{ display: "flex", flex: 1, gap: 0.5 }}>
                            {dayData.map((val, hourIndex) => (
                              <Box
                                key={`cell-${dayIndex}-${hourIndex}`}
                                title={`${DAYS[dayIndex]} ${hourIndex}:00 - ${val} bookings`}
                                sx={{
                                  flex: 1,
                                  height: 24,
                                  bgcolor: getHeatmapColor(val, maxVal || 1),
                                  borderRadius: 0.5,
                                  cursor: "pointer",
                                  transition: "transform 150ms",
                                  "&:hover": {
                                    transform: "scale(1.2)",
                                    zIndex: 1,
                                    border: "1px solid #22c55e"
                                  }
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default AnalyticsDashboard;
