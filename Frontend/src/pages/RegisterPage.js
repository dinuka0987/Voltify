import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import EvStationIcon from "@mui/icons-material/EvStation";
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
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const RegisterPage = ({ colorMode }) => {
  const navigate = useNavigate();
  const isDark = colorMode === "dark";
  const [accountType, setAccountType] = useState("user"); // "user" = EV Driver, "admin" = Parking Owner
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    vehicleNumber: "",
    vehicleType: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      navigate(role === "admin" ? "/admin/welcome" : "/user/welcome");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAccountTypeChange = (type) => {
    setAccountType(type);
    // Clear vehicle fields when switching to parking owner
    if (type === "admin") {
      setFormData((prev) => ({
        ...prev,
        vehicleNumber: "",
        vehicleType: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: accountType,
      };

      // Only include vehicle details for EV Driver
      if (accountType === "user") {
        payload.vehicleNumber = formData.vehicleNumber;
        payload.vehicleType = formData.vehicleType || undefined;
      }

      await API.post("/auth/register", payload);

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const isEvDriver = accountType === "user";

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
      <Container maxWidth="md" sx={{ py: 5, position: "relative", zIndex: 1 }}>
        <Card
          sx={{
            animation: "ev-slideUp 600ms ease-out both",
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
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <img src="/logo.png" alt="Voltify Logo" style={{ height: "48px", objectFit: "contain" }} />
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 800,
                    fontSize: "1.2rem",
                  }}
                >
                  Voltify
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                  {isEvDriver ? "Create your driver account" : "Create your parking owner account"}
                </Typography>
              </Box>
            </Box>

            {/* Account Type Toggle */}
            <Box
              sx={{
                display: "flex",
                p: 0.5,
                my: 3,
                borderRadius: 3,
                bgcolor: isDark ? "rgba(148, 163, 184, 0.06)" : "rgba(15, 23, 42, 0.04)",
                border: "1px solid",
                borderColor: isDark ? "rgba(148, 163, 184, 0.08)" : "rgba(15, 23, 42, 0.06)",
              }}
            >
              {[
                { type: "user", label: "EV Driver", icon: <EvStationIcon sx={{ fontSize: 18 }} /> },
                { type: "admin", label: "Parking Owner", icon: <LocalParkingIcon sx={{ fontSize: 18 }} /> },
              ].map(({ type, label, icon }) => {
                const selected = accountType === type;
                return (
                  <Box
                    key={type}
                    onClick={() => handleAccountTypeChange(type)}
                    sx={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      py: 1.2,
                      px: 2,
                      borderRadius: 2.5,
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      fontFamily: "'Outfit', sans-serif",
                      transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
                      color: selected ? "#fff" : "text.secondary",
                      background: selected
                        ? type === "user"
                          ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                          : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                        : "transparent",
                      boxShadow: selected
                        ? type === "user"
                          ? "0 4px 14px rgba(34, 197, 94, 0.35)"
                          : "0 4px 14px rgba(37, 99, 235, 0.35)"
                        : "none",
                      "&:hover": {
                        background: selected
                          ? type === "user"
                            ? "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)"
                            : "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)"
                          : isDark
                          ? "rgba(148, 163, 184, 0.08)"
                          : "rgba(15, 23, 42, 0.06)",
                      },
                    }}
                  >
                    {icon}
                    {label}
                  </Box>
                );
              })}
            </Box>

            {/* Step indicator */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mb: 3,
              }}
            >
              {(isEvDriver
                ? ["Personal Info", "Vehicle Details"]
                : ["Personal Info", "Account Setup"]
              ).map((step, i) => (
                <Box
                  key={step}
                  sx={{
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      height: 3,
                      borderRadius: 2,
                      mb: 0.75,
                      background: i === 0
                        ? isEvDriver
                          ? "linear-gradient(90deg, #22c55e, #10b981)"
                          : "linear-gradient(90deg, #2563eb, #60a5fa)"
                        : isDark ? "rgba(148, 163, 184, 0.1)" : "rgba(15, 23, 42, 0.06)",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: i === 0 ? (isEvDriver ? "primary.main" : "secondary.main") : "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {step}
                  </Typography>
                </Box>
              ))}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2.5 }} onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOffIcon sx={{ fontSize: 20 }} /> : <VisibilityIcon sx={{ fontSize: 20 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={isEvDriver ? 6 : 12}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Vehicle fields — only shown for EV Drivers */}
                {isEvDriver && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Vehicle Number"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DirectionsCarIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        select
                        fullWidth
                        label="Vehicle Type"
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleChange}
                      >
                        <MenuItem value="">Any</MenuItem>
                        <MenuItem value="sedan">Sedan</MenuItem>
                        <MenuItem value="suv">SUV</MenuItem>
                        <MenuItem value="hatchback">Hatchback</MenuItem>
                        <MenuItem value="truck">Truck</MenuItem>
                      </TextField>
                    </Grid>
                  </>
                )}
              </Grid>

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
                  background: isEvDriver
                    ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                    : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  boxShadow: isEvDriver
                    ? "0 4px 14px rgba(34, 197, 94, 0.35)"
                    : "0 4px 14px rgba(37, 99, 235, 0.35)",
                  "&:hover": {
                    background: isEvDriver
                      ? "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)"
                      : "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : isEvDriver ? (
                  "Create Driver Account"
                ) : (
                  "Create Owner Account"
                )}
              </Button>
            </form>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Link to="/login" style={{ color: "#22c55e", fontWeight: 700, textDecoration: "none" }}>
                  Sign in
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default RegisterPage;
