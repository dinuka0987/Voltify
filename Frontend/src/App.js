import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import { Typography } from "@mui/material";
import "./App.css";

// Pages & Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReports from "./pages/admin/AdminReports";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import Announcements from "./pages/admin/Announcements";
import BookingMonitor from "./pages/admin/BookingMonitor";
import ChargingRates from "./pages/admin/ChargingRates";
import Maintenance from "./pages/admin/Maintenance";
import SlotManagement from "./pages/admin/SlotManagement";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SettingsPage from "./pages/SettingsPage";
import WelcomePage from "./pages/WelcomePage";
import UserHome from "./pages/user/Home";
import ChargingSession from "./pages/user/ChargingSession";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [colorMode, setColorMode] = useState(() => localStorage.getItem("colorMode") || "dark");

  const isDark = colorMode === "dark";
  const toggleColorMode = () => {
    setColorMode((currentMode) => {
      const nextMode = currentMode === "light" ? "dark" : "light";
      localStorage.setItem("colorMode", nextMode);
      return nextMode;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: colorMode,
          background: {
            default: isDark ? "#0f172a" : "#f8fafc",
            paper: isDark ? "#1e293b" : "#ffffff",
          },
          text: {
            primary: isDark ? "#f8fafc" : "#0f172a",
            secondary: isDark ? "#94a3b8" : "#64748b",
          },
          primary: {
            main: "#22c55e",
            dark: "#16a34a",
            light: "#4ade80",
          },
          secondary: {
            main: "#2563eb",
            dark: "#1d4ed8",
            light: "#60a5fa",
          },
          success: {
            main: "#22c55e",
            dark: "#16a34a",
            light: "#4ade80",
          },
          warning: {
            main: "#facc15",
            dark: "#eab308",
            light: "#fde047",
          },
          error: {
            main: "#ef4444",
            dark: "#dc2626",
            light: "#f87171",
          },
          info: {
            main: "#06b6d4",
          },
          divider: isDark ? "rgba(148, 163, 184, 0.08)" : "rgba(15, 23, 42, 0.08)",
        },
        typography: {
          fontFamily: "'Inter', 'Roboto', -apple-system, sans-serif",
          h1: { fontFamily: "'Outfit', 'Inter', sans-serif", fontWeight: 800 },
          h2: { fontFamily: "'Outfit', 'Inter', sans-serif", fontWeight: 800 },
          h3: { fontFamily: "'Outfit', 'Inter', sans-serif", fontWeight: 700 },
          h4: { fontFamily: "'Outfit', 'Inter', sans-serif", fontWeight: 700 },
          h5: { fontFamily: "'Outfit', 'Inter', sans-serif", fontWeight: 700 },
          h6: { fontFamily: "'Outfit', 'Inter', sans-serif", fontWeight: 700 },
          subtitle1: { fontWeight: 600 },
          subtitle2: { fontWeight: 600 },
          button: { fontWeight: 700, textTransform: "none" },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                border: `1px solid ${isDark ? "rgba(148, 163, 184, 0.06)" : "rgba(15, 23, 42, 0.06)"}`,
                boxShadow: isDark
                  ? "0 4px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(148, 163, 184, 0.04)"
                  : "0 4px 24px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(15, 23, 42, 0.03)",
                backgroundImage: "none",
                transition: "transform 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  boxShadow: isDark
                    ? "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(148, 163, 184, 0.06)"
                    : "0 8px 32px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(15, 23, 42, 0.04)",
                },
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 10,
                padding: "10px 24px",
                fontSize: "0.875rem",
                letterSpacing: "0.01em",
              },
              contained: {
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                boxShadow: "0 4px 14px rgba(34, 197, 94, 0.35)",
                "&:hover": {
                  background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
                  boxShadow: "0 6px 20px rgba(34, 197, 94, 0.45)",
                },
              },
              outlined: {
                borderWidth: "1.5px",
                "&:hover": {
                  borderWidth: "1.5px",
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
                  borderRadius: 10,
                  transition: "box-shadow 250ms ease",
                  "&.Mui-focused": {
                    boxShadow: `0 0 0 3px ${isDark ? "rgba(34, 197, 94, 0.15)" : "rgba(34, 197, 94, 0.1)"}`,
                  },
                },
              },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                backgroundColor: isDark ? "rgba(148, 163, 184, 0.04)" : "rgba(241, 245, 249, 0.8)",
                "& .MuiTableCell-head": {
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: isDark ? "#94a3b8" : "#64748b",
                  borderBottom: `1px solid ${isDark ? "rgba(148, 163, 184, 0.08)" : "rgba(15, 23, 42, 0.06)"}`,
                },
              },
            },
          },
          MuiTableBody: {
            styleOverrides: {
              root: {
                "& .MuiTableRow-root": {
                  transition: "background-color 150ms ease",
                  "&:hover": {
                    backgroundColor: isDark ? "rgba(34, 197, 94, 0.04)" : "rgba(34, 197, 94, 0.02)",
                  },
                },
                "& .MuiTableCell-root": {
                  borderBottom: `1px solid ${isDark ? "rgba(148, 163, 184, 0.06)" : "rgba(15, 23, 42, 0.04)"}`,
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 700,
                fontSize: "0.75rem",
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 16,
                backgroundImage: "none",
                border: `1px solid ${isDark ? "rgba(148, 163, 184, 0.08)" : "rgba(15, 23, 42, 0.06)"}`,
              },
            },
          },
          MuiAlert: {
            styleOverrides: {
              root: {
                borderRadius: 10,
                fontWeight: 600,
              },
            },
          },
          MuiAvatar: {
            styleOverrides: {
              root: {
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
              },
            },
          },
          MuiTab: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.9rem",
                minHeight: 48,
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundImage: "none",
              },
            },
          },
        },
      }),
    [colorMode, isDark]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box className="ev-loading-spinner" sx={{ bgcolor: "background.default", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <Box className="ev-loading-bolt" sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <ElectricBoltIcon sx={{ fontSize: 48, color: "#22c55e" }} />
          </Box>
          <Typography sx={{ color: "text.secondary", fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
            Loading EV Parking...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} colorMode={colorMode} />}
        <Box
          component="main"
          className={isAuthenticated ? "app-main" : ""}
          sx={{
            background: isDark
              ? "radial-gradient(ellipse at top right, rgba(34, 197, 94, 0.08), transparent 50%), radial-gradient(ellipse at bottom left, rgba(37, 99, 235, 0.05), transparent 50%), #0f172a"
              : "radial-gradient(ellipse at top right, rgba(34, 197, 94, 0.06), transparent 50%), radial-gradient(ellipse at bottom left, rgba(37, 99, 235, 0.03), transparent 50%), #f8fafc",
            minHeight: "100vh",
          }}
        >
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} colorMode={colorMode} onToggleColorMode={toggleColorMode} />} />
          <Route path="/register" element={<RegisterPage colorMode={colorMode} />} />

          {/* Welcome Page */}
          <Route path="/user/welcome" element={<ProtectedRoute component={<WelcomePage />} role={userRole} requiredRole="user" />} />
          <Route path="/admin/welcome" element={<ProtectedRoute component={<WelcomePage />} role={userRole} requiredRole="admin" />} />

          {/* User Routes */}
          <Route path="/user/home" element={<ProtectedRoute component={<UserHome />} role={userRole} requiredRole="user" />} />
          <Route path="/user/charging" element={<ProtectedRoute component={<ChargingSession />} role={userRole} requiredRole="user" />} />
          <Route path="/user/profile" element={<Navigate to="/user/settings" replace />} />
          <Route path="/user/settings" element={<ProtectedRoute component={<SettingsPage colorMode={colorMode} onToggleColorMode={toggleColorMode} />} role={userRole} requiredRole="user" />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute component={<AdminDashboard />} role={userRole} requiredRole="admin" />} />
          <Route path="/admin/announcements" element={<ProtectedRoute component={<Announcements />} role={userRole} requiredRole="admin" />} />
          <Route path="/admin/maintenance" element={<ProtectedRoute component={<Maintenance />} role={userRole} requiredRole="admin" />} />
          <Route path="/admin/analytics" element={<ProtectedRoute component={<AnalyticsDashboard />} role={userRole} requiredRole="admin" />} />
          <Route path="/admin/slots" element={<ProtectedRoute component={<SlotManagement />} role={userRole} requiredRole="admin" />} />
          <Route path="/admin/bookings" element={<ProtectedRoute component={<BookingMonitor />} role={userRole} requiredRole="admin" />} />
          <Route path="/admin/rates" element={<ProtectedRoute component={<ChargingRates />} role={userRole} requiredRole="admin" />} />
          <Route path="/admin/profile" element={<Navigate to="/admin/settings" replace />} />
          <Route path="/admin/reports" element={<ProtectedRoute component={<AdminReports />} role={userRole} requiredRole="admin" />} />
          <Route path="/admin/settings" element={<ProtectedRoute component={<SettingsPage colorMode={colorMode} onToggleColorMode={toggleColorMode} />} role={userRole} requiredRole="admin" />} />

          {/* Default Route */}
          <Route path="/" element={isAuthenticated ? userRole === "admin" ? <Navigate to="/admin/dashboard" /> : <Navigate to="/user/home" /> : <Navigate to="/login" />} />
        </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
