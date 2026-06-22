import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BarChartIcon from "@mui/icons-material/BarChart";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import PaidIcon from "@mui/icons-material/Paid";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import EvStationIcon from "@mui/icons-material/EvStation";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CampaignIcon from "@mui/icons-material/Campaign";
import BuildIcon from "@mui/icons-material/Build";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import HistoryIcon from "@mui/icons-material/History";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import socket from "../socket";
import NotificationPanel from "./NotificationPanel";

const drawerWidth = 272;

const Navbar = ({ setIsAuthenticated, colorMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = React.useState(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [supportOpen, setSupportOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastNotif, setToastNotif] = useState(null);
  const userRole = localStorage.getItem("role");
  const userName = localStorage.getItem("name") || "User";
  const firstName = userName.split(" ")[0];
  const isDark = colorMode === "dark";

  const adminLinks = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <DashboardIcon /> },
    { label: "Announcements", path: "/admin/announcements", icon: <CampaignIcon /> },
    { label: "Maintenance", path: "/admin/maintenance", icon: <BuildIcon /> },
    { label: "Analytics", path: "/admin/analytics", icon: <AnalyticsIcon /> },
    { label: "Slots", path: "/admin/slots", icon: <CalendarMonthIcon /> },
    { label: "Bookings", path: "/admin/bookings", icon: <BookOnlineIcon /> },
    { label: "Rates", path: "/admin/rates", icon: <PaidIcon /> },
    { label: "Reports", path: "/admin/reports", icon: <BarChartIcon /> },
    { label: "Settings", path: "/admin/settings", icon: <SettingsIcon /> },
  ];

  const userLinks = [
    { label: "Home", path: "/user/home", icon: <HomeIcon /> },
    { label: "History", path: "/user/charging", icon: <HistoryIcon /> },
    { label: "Settings", path: "/user/settings", icon: <SettingsIcon /> },
  ];

  const links = userRole === "admin" ? adminLinks : userLinks;

  const fetchUnreadCount = async () => {
    try {
      if (localStorage.getItem("token")) {
        const res = await API.get("/notifications/unread-count");
        setUnreadCount(res.data.count);
      }
    } catch (err) {
      console.log("Failed to load unread count");
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const handleNewNotification = (notif) => {
      // Just re-fetch the unread count when a new notification arrives
      fetchUnreadCount();
      
      // Show realtime popup for drivers
      if (userRole === "user") {
        setToastNotif(notif);
        setToastOpen(true);
      }
    };

    const userId = localStorage.getItem("token") ? JSON.parse(atob(localStorage.getItem("token").split('.')[1])).id : null;

    if (userId) {
      socket.on(`notification-${userId}`, handleNewNotification);
    }
    socket.on("notification-broadcast", handleNewNotification);

    return () => {
      if (userId) {
        socket.off(`notification-${userId}`, handleNewNotification);
      }
      socket.off("notification-broadcast", handleNewNotification);
    };
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    setIsAuthenticated(false);
    handleMenuClose();
    navigate("/login");
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", px: 2, py: 2.5 }}>
      <List sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {links.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItemButton
              key={`${item.label}-${item.path}`}
              selected={selected}
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled) {
                  navigate(item.path);
                  setMobileOpen(false);
                }
              }}
              sx={{
                borderRadius: 2.5,
                minHeight: 48,
                px: 2,
                color: selected ? "#fff" : "text.secondary",
                position: "relative",
                overflow: "hidden",
                transition: "all 200ms ease",
                "&.Mui-selected": {
                  background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  boxShadow: "0 4px 16px rgba(34, 197, 94, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
                  },
                },
                "&:not(.Mui-selected):hover": {
                  backgroundColor: isDark ? "rgba(148, 163, 184, 0.06)" : "rgba(34, 197, 94, 0.04)",
                  color: "text.primary",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "inherit",
                  minWidth: 40,
                  "& .MuiSvgIcon-root": {
                    fontSize: 21,
                    transition: "transform 200ms ease",
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: selected ? 700 : 600,
                  fontSize: "0.875rem",
                  fontFamily: "'Outfit', sans-serif",
                }}
              />
              {selected && (
                <Box
                  sx={{
                    position: "absolute",
                    right: 12,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#fff",
                    opacity: 0.8,
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      {userRole === "user" && (
        <Box
          sx={{
            mt: "auto",
            p: 2.5,
            borderRadius: 3,
            background: isDark
              ? "linear-gradient(180deg, rgba(34, 197, 94, 0.08), rgba(37, 99, 235, 0.04))"
              : "linear-gradient(180deg, rgba(34, 197, 94, 0.06), rgba(241, 245, 249, 1))",
            border: "1px solid",
            borderColor: isDark ? "rgba(34, 197, 94, 0.1)" : "rgba(34, 197, 94, 0.08)",
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: "rgba(34, 197, 94, 0.12)",
              color: "#22c55e",
              mb: 2,
            }}
          >
            <HelpOutlineIcon sx={{ fontSize: 20 }} />
          </Avatar>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.9rem",
              mb: 0.5,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Need Help?
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, fontSize: "0.8rem" }}>
            Contact support for parking and charging assistance.
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            onClick={() => setSupportOpen(true)}
            sx={{ borderRadius: 2, fontSize: "0.8rem" }}
          >
            Contact Support
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: isDark
            ? "linear-gradient(90deg, rgba(10, 14, 26, 0.85), rgba(17, 24, 39, 0.9))"
            : "linear-gradient(90deg, rgba(255, 255, 255, 0.9), rgba(241, 245, 249, 0.95))",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid",
          borderBottomColor: isDark ? "rgba(148, 163, 184, 0.06)" : "rgba(15, 23, 42, 0.06)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: 72, gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{
                display: { xs: "inline-flex", md: "none" },
                mr: 0.5,
                color: "text.primary",
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mr: 1,
              }}
            >
              <img src="/logo.png" alt="Voltify Logo" style={{ height: "36px", objectFit: "contain", marginRight: "10px" }} />
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  whiteSpace: "nowrap",
                  color: "text.primary",
                  lineHeight: 1.2,
                }}
              >
                Voltify
              </Typography>
            </Box>

            {/* Role badge */}
            <Box
              className={userRole === "admin" ? "ev-role-badge ev-role-badge--admin" : "ev-role-badge ev-role-badge--user"}
              sx={{ ml: 1.5, display: { xs: "none", sm: "flex" } }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: userRole === "admin" ? "#2563EB" : "#22C55E",
                }}
              />
              {userRole === "admin" ? "Admin" : "Driver"}
            </Box>
          </Box>

          {/* Notifications */}
          <IconButton
            onClick={(e) => setNotifAnchorEl(e.currentTarget)}
            sx={{ color: "text.primary", ml: 1 }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <NotificationPanel 
            anchorEl={notifAnchorEl} 
            open={Boolean(notifAnchorEl)} 
            onClose={() => setNotifAnchorEl(null)} 
            updateUnreadCount={fetchUnreadCount}
          />

          {/* User profile display */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.8,
              borderRadius: 2.5,
              color: "text.primary",
              border: "1px solid",
              borderColor: isDark ? "rgba(148, 163, 184, 0.08)" : "rgba(15, 23, 42, 0.06)",
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "rgba(59, 130, 246, 0.12)",
                color: "#3b82f6",
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              {firstName.charAt(0).toUpperCase()}
            </Avatar>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.85rem",
                display: { xs: "none", sm: "block" },
              }}
            >
              {firstName}
            </Typography>
          </Box>


        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderRightColor: isDark ? "rgba(148, 163, 184, 0.06)" : "rgba(15, 23, 42, 0.06)",
            top: 72,
            height: "calc(100% - 72px)",
            backgroundColor: "background.paper",
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "background.paper",
          },
        }}
      >
        {drawer}
      </Drawer>

      <Dialog
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 4,
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            pb: 1,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Parking Area Support
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 3, fontSize: "0.9rem" }}>
            Reach the parking support desk for booking, slot, and charging assistance.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              p: 2.5,
              borderRadius: 3,
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: "rgba(34, 197, 94, 0.1)",
                  color: "#22c55e",
                  boxShadow: "0 4px 12px rgba(34, 197, 94, 0.15)",
                }}
              >
                <EmailIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, mb: 0.25 }}>
                  Email Support
                </Typography>
                <Typography
                  component="a"
                  href="mailto:support@evparking.com"
                  sx={{
                    fontWeight: 700,
                    overflowWrap: "anywhere",
                    fontSize: "0.95rem",
                    color: "text.primary",
                    textDecoration: "none",
                    "&:hover": { color: "#22c55e" },
                    transition: "color 0.2s",
                  }}
                >
                  support@evparking.com
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: "rgba(37, 99, 235, 0.1)",
                  color: "#2563eb",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)",
                }}
              >
                <PhoneIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, mb: 0.25 }}>
                  Phone Support
                </Typography>
                <Typography
                  component="a"
                  href="tel:+94771234567"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "text.primary",
                    textDecoration: "none",
                    "&:hover": { color: "#2563eb" },
                    transition: "color 0.2s",
                  }}
                >
                  +94 77 123 4567
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setSupportOpen(false)} variant="contained" fullWidth>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toastOpen}
        autoHideDuration={6000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 7 }}
      >
        <Alert 
          onClose={() => setToastOpen(false)} 
          severity={toastNotif?.priority === "critical" ? "error" : toastNotif?.priority === "warning" ? "warning" : toastNotif?.priority === "success" ? "success" : "info"} 
          sx={{ width: "100%", boxShadow: 3, borderRadius: 2 }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{toastNotif?.title}</Typography>
          <Typography variant="body2">{toastNotif?.message}</Typography>
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;
