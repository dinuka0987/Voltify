import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import EmailIcon from "@mui/icons-material/Email";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Typography,
  useTheme,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const WelcomePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState(0);
  const userRole = localStorage.getItem("role") || "user";
  const userName = localStorage.getItem("name") || "User";
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const fetchProfile = useCallback(async () => {
    try {
      const response = await API.get("/auth/profile");
      setProfile(response.data);
    } catch (err) {
      console.log("Could not load profile for welcome page");
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Auto-redirect after 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    const timeout = setTimeout(() => {
      navigate(userRole === "admin" ? "/admin/dashboard" : "/user/home");
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate, userRole]);

  const handleContinue = () => {
    navigate(userRole === "admin" ? "/admin/dashboard" : "/user/home");
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isDark
          ? "linear-gradient(135deg, #0a0e1a 0%, #111827 40%, #0f172a 100%)"
          : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 40%, #f1f5f9 100%)",
        overflow: "hidden",
      }}
    >
      {/* Background particles */}
      <Box className="ev-welcome-bg">
        <Box className="ev-welcome-particle" />
        <Box className="ev-welcome-particle" />
        <Box className="ev-welcome-particle" />
        <Box className="ev-welcome-particle" />
      </Box>

      {/* Content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 680,
          width: "100%",
          px: 3,
          animation: "ev-scaleIn 600ms ease-out both",
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1.5,
            mb: 4,
            animation: "ev-slideDown 500ms ease-out both",
          }}
        >
          <img src="/logo.png" alt="Voltify Logo" style={{ height: "64px", objectFit: "contain" }} />
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              color: isDark ? "#f1f5f9" : "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            Voltify
          </Typography>
        </Box>

        {/* Greeting */}
        <Typography
          sx={{
            fontSize: { xs: 14, sm: 16 },
            color: "#94a3b8",
            fontWeight: 500,
            mb: 1,
            animation: "ev-slideUp 500ms ease-out 200ms both",
          }}
        >
          {getGreeting()},
        </Typography>

        <Typography
          variant="h2"
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900,
            fontSize: { xs: "2rem", sm: "2.8rem", md: "3.2rem" },
            background: isDark
              ? "linear-gradient(135deg, #f1f5f9, #e2e8f0, #22c55e)"
              : "linear-gradient(135deg, #0f172a, #334155, #22c55e)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            mb: 2,
            animation: "ev-slideUp 500ms ease-out 300ms both",
            lineHeight: 1.2,
          }}
        >
          {userName}
        </Typography>

        {/* Role badge */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 2.5,
            py: 1,
            borderRadius: 3,
            mb: 4,
            animation: "ev-slideUp 500ms ease-out 400ms both",
            background: userRole === "admin"
              ? "linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(37, 99, 235, 0.05))"
              : "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))",
            border: `1px solid ${userRole === "admin" ? "rgba(37, 99, 235, 0.2)" : "rgba(34, 197, 94, 0.2)"}`,
          }}
        >
          {userRole === "admin" ? (
            <AdminPanelSettingsIcon sx={{ fontSize: 18, color: "#60a5fa" }} />
          ) : (
            <PersonIcon sx={{ fontSize: 18, color: "#4ade80" }} />
          )}
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 13,
              color: userRole === "admin" ? "#60a5fa" : "#4ade80",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {userRole === "admin" ? "Administrator" : "EV Driver"}
          </Typography>
        </Box>


        {/* Dynamic Welcome Message */}
        <Box
          sx={{
            mb: 4,
            mx: "auto",
            px: 3,
            py: 2,
            borderRadius: 3,
            background: isDark ? "rgba(30, 41, 59, 0.6)" : "#FFFFFF",
            border: `1px solid ${userRole === "admin" ? "rgba(37, 99, 235, 0.15)" : "rgba(34, 197, 94, 0.15)"}`,
            boxShadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.02)",
            backdropFilter: "blur(10px)",
            animation: "ev-slideUp 500ms ease-out 500ms both",
            display: "block",
            maxWidth: 450,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.95rem",
              color: isDark ? "#cbd5e1" : "#0F172A", // Text Primary
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            {userRole === "admin" 
              ? "All systems are operational. You're ready to manage parking and charging stations." 
              : "Ready to charge your vehicle? Find the nearest available parking slot and plug in."}
          </Typography>
        </Box>

        {/* Date & Time */}
        <Typography
          sx={{
            fontSize: 14,
            color: "#64748b",
            mb: 4,
            animation: "ev-slideUp 500ms ease-out 600ms both",
          }}
        >
          {currentDate} • {currentTime}
        </Typography>

        {/* Continue button */}
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={handleContinue}
          sx={{
            px: 5,
            py: 1.8,
            fontSize: "1rem",
            borderRadius: 3,
            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            boxShadow: "0 8px 32px rgba(34, 197, 94, 0.4)",
            mb: 4,
            animation: "ev-slideUp 500ms ease-out 700ms both",
            "&:hover": {
              background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
              boxShadow: "0 12px 40px rgba(34, 197, 94, 0.5)",
              transform: "translateY(-2px)",
            },
            transition: "all 300ms ease",
          }}
        >
          Continue to {userRole === "admin" ? "Dashboard" : "Home"}
        </Button>

        {/* Progress bar */}
        <Box
          sx={{
            maxWidth: 300,
            mx: "auto",
            animation: "ev-slideUp 500ms ease-out 800ms both",
          }}
        >
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 4,
              borderRadius: 2,
              backgroundColor: "rgba(148, 163, 184, 0.1)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 2,
                background: "linear-gradient(90deg, #22c55e, #2563eb)",
              },
            }}
          />
          <Typography sx={{ fontSize: 12, color: "#475569", mt: 1, fontWeight: 500 }}>
            Auto-redirecting in a moment...
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default WelcomePage;
