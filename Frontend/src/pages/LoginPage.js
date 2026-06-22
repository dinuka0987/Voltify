import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const LoginPage = ({ setIsAuthenticated, setUserRole, colorMode, onToggleColorMode }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isDark = colorMode === "dark";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      navigate(role === "admin" ? "/admin/welcome" : "/user/welcome");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await API.post("/auth/login", { email, password });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("name", user.name);

      setIsAuthenticated(true);
      setUserRole(user.role);
      navigate(user.role === "admin" ? "/admin/welcome" : "/user/welcome");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      className="ev-auth-bg"
      sx={{
        display: "flex",
        alignItems: "center",
        background: isDark
          ? "linear-gradient(135deg, #0a0e1a 0%, #111827 50%, #0f172a 100%)"
          : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 5, position: "relative", zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Left side — branding */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                animation: "ev-slideUp 600ms ease-out both",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
                <img src="/logo.png" alt="Voltify Logo" style={{ height: "48px", objectFit: "contain" }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Voltify
                </Typography>
              </Box>

              <Typography
                variant="h3"
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 900,
                  color: "text.primary",
                  mb: 2.5,
                  lineHeight: 1.15,
                  fontSize: { xs: "1.8rem", sm: "2.4rem", md: "2.8rem" },
                }}
              >
                Smart parking{" "}
                <Box
                  component="span"
                  sx={{
                    background: "linear-gradient(135deg, #22c55e, #10b981)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  control
                </Box>{" "}
                for EV drivers
              </Typography>

              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: 15, sm: 17 },
                  maxWidth: 480,
                  lineHeight: 1.7,
                  mb: 4,
                }}
              >
                Find available charging slots, reserve parking spaces, monitor charging sessions, and manage your EV journey in real time from one intelligent platform
              </Typography>

              {/* Feature pills */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                {["Real-time Slots", "EV Charging", "Smart Booking", "Analytics"].map((feature) => (
                  <Box
                    key={feature}
                    sx={{
                      px: 2,
                      py: 0.8,
                      borderRadius: 2,
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      bgcolor: isDark ? "rgba(34, 197, 94, 0.08)" : "rgba(34, 197, 94, 0.06)",
                      color: "#22c55e",
                      border: "1px solid",
                      borderColor: isDark ? "rgba(34, 197, 94, 0.15)" : "rgba(34, 197, 94, 0.1)",
                    }}
                  >
                    {feature}
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Right side — login form */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                animation: "ev-slideUp 600ms ease-out 200ms both",
                background: isDark
                  ? "rgba(17, 24, 39, 0.8)"
                  : "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid",
                borderColor: isDark ? "rgba(148, 163, 184, 0.08)" : "rgba(15, 23, 42, 0.06)",
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                {/* Theme toggle */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      bgcolor: isDark ? "rgba(148, 163, 184, 0.06)" : "rgba(15, 23, 42, 0.03)",
                    }}
                  >
                    <LightModeIcon sx={{ fontSize: 16, color: !isDark ? "#f59e0b" : "text.secondary" }} />
                    <Switch
                      checked={isDark}
                      onChange={onToggleColorMode}
                      size="small"
                    />
                    <DarkModeIcon sx={{ fontSize: 16, color: isDark ? "#2563eb" : "text.secondary" }} />
                  </Box>
                </Box>

                <Typography
                  variant="h4"
                  sx={{
                    mb: 0.5,
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 800,
                    fontSize: { xs: "1.5rem", md: "1.75rem" },
                  }}
                >
                  Welcome back
                </Typography>
                <Typography sx={{ color: "text.secondary", mb: 3.5, fontSize: "0.9rem" }}>
                  Sign in to continue to your dashboard.
                </Typography>

                {error && (
                  <Alert
                    severity="error"
                    sx={{ mb: 2.5, borderRadius: 2.5 }}
                    onClose={() => setError("")}
                  >
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? (
                              <VisibilityOffIcon sx={{ fontSize: 20 }} />
                            ) : (
                              <VisibilityIcon sx={{ fontSize: 20 }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    disabled={loading}
                    sx={{
                      mt: 3.5,
                      py: 1.5,
                      fontSize: "0.95rem",
                      borderRadius: 2.5,
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <Box sx={{ mt: 3, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      style={{
                        color: "#22c55e",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      Create account
                    </Link>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LoginPage;
