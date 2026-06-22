import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Button,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import PaidIcon from "@mui/icons-material/Paid";
import CampaignIcon from "@mui/icons-material/Campaign";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CircleIcon from "@mui/icons-material/Circle";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const getIconAndColor = (type, priority) => {
  let icon = <CampaignIcon fontSize="small" />;
  if (type === "booking") icon = <BookOnlineIcon fontSize="small" />;
  if (type === "charging") icon = <ElectricBoltIcon fontSize="small" />;
  if (type === "payment") icon = <PaidIcon fontSize="small" />;
  if (type === "system") icon = <CampaignIcon fontSize="small" />;

  let color = "#3b82f6"; // normal (blue)
  let bgColor = "rgba(59, 130, 246, 0.1)";

  if (priority === "critical") {
    color = "#ef4444"; // red
    bgColor = "rgba(239, 68, 68, 0.1)";
  } else if (priority === "warning") {
    color = "#f59e0b"; // orange
    bgColor = "rgba(245, 158, 11, 0.1)";
  } else if (priority === "success") {
    color = "#10b981"; // green
    bgColor = "rgba(16, 185, 129, 0.1)";
  }

  return { icon, color, bgColor };
};

const NotificationPanel = ({ anchorEl, open, onClose, updateUnreadCount }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchNotifications = async (tab, pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      const res = await API.get(`/notifications?type=${tab}&page=${pageNum}&limit=15`);
      setNotifications(append ? [...notifications, ...res.data.notifications] : res.data.notifications);
      setHasMore(pageNum < res.data.totalPages);
      setPage(pageNum);
      
      // Update badge count
      if (updateUnreadCount) updateUnreadCount();
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchNotifications(activeTab, 1, false);
    }
  }, [open, activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      if (updateUnreadCount) updateUnreadCount();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put(`/notifications/mark-all-read`);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      if (updateUnreadCount) updateUnreadCount();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      if (updateUnreadCount) updateUnreadCount();
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleActionClick = (notif) => {
    if (!notif.isRead) markAsRead(notif._id);
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
      onClose();
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      disableAutoFocusItem
      PaperProps={{
        sx: {
          mt: 1.5,
          width: 400,
          maxWidth: "100%",
          maxHeight: 600,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundImage: "none",
          display: "flex",
          flexDirection: "column",
          p: 0,
          overflow: "hidden", // We handle scroll in inner container
        },
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "background.paper" }}>
        <Typography sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", fontSize: "1.1rem" }}>
          Notifications
        </Typography>
        <Button 
          size="small" 
          startIcon={<DoneAllIcon />} 
          onClick={markAllAsRead}
          sx={{ textTransform: "none", fontSize: "0.8rem", color: "text.secondary", "&:hover": { color: "primary.main" } }}
        >
          Mark all read
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 40, "& .MuiTab-root": { minHeight: 40, py: 0, textTransform: "none", fontWeight: 600, fontSize: "0.85rem" } }}
        >
          <Tab label="All" value="all" />
          <Tab label="Bookings" value="booking" />
          <Tab label="Charging" value="charging" />
          <Tab label="Payments" value="payment" />
          <Tab label="System" value="system" />
        </Tabs>
      </Box>

      {/* Notification List */}
      <Box sx={{ overflowY: "auto", flex: 1, maxHeight: 450, bgcolor: "background.default" }}>
        {loading && notifications.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress size={30} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary" sx={{ fontSize: "0.9rem" }}>
              No notifications found
            </Typography>
          </Box>
        ) : (
          notifications.map((notif) => {
            const { icon, color, bgColor } = getIconAndColor(notif.type, notif.priority);
            
            return (
              <Box
                key={notif._id}
                onClick={() => !notif.isRead && markAsRead(notif._id)}
                sx={{
                  px: 2,
                  py: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  borderLeft: `4px solid ${notif.isRead ? "transparent" : color}`,
                  bgcolor: notif.isRead ? "background.paper" : "rgba(128, 128, 128, 0.03)",
                  display: "flex",
                  gap: 1.5,
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  "&:hover": {
                    bgcolor: "rgba(128, 128, 128, 0.06)",
                    "& .delete-btn": { opacity: 1 }
                  }
                }}
              >
                <Avatar sx={{ width: 36, height: 36, bgcolor: bgColor, color }}>
                  {icon}
                </Avatar>
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                    <Typography 
                      sx={{ 
                        fontWeight: notif.isRead ? 600 : 700, 
                        fontSize: "0.9rem",
                        color: notif.isRead ? "text.secondary" : "text.primary" 
                      }}
                    >
                      {notif.title}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontSize: "0.75rem", color: "text.disabled", whiteSpace: "nowrap" }}>
                        {formatTimeAgo(notif.createdAt)}
                      </Typography>
                      {!notif.isRead && (
                        <CircleIcon sx={{ fontSize: 10, color: "#3b82f6" }} />
                      )}
                    </Box>
                  </Box>
                  
                  <Typography 
                    sx={{ 
                      fontSize: "0.85rem", 
                      color: notif.isRead ? "text.disabled" : "text.secondary",
                      lineHeight: 1.4,
                      mb: notif.actionLabel ? 1 : 0
                    }}
                  >
                    {notif.message}
                  </Typography>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                    {notif.actionLabel ? (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => { e.stopPropagation(); handleActionClick(notif); }}
                        sx={{ 
                          py: 0.2, px: 1.5, fontSize: "0.75rem", borderRadius: 1.5,
                          borderColor: color, color: color,
                          "&:hover": { bgcolor: bgColor, borderColor: color }
                        }}
                      >
                        {notif.actionLabel}
                      </Button>
                    ) : (
                      <Box /> // placeholder
                    )}

                    <IconButton 
                      className="delete-btn"
                      size="small" 
                      onClick={(e) => deleteNotification(notif._id, e)}
                      sx={{ opacity: 0, transition: "opacity 0.2s", color: "text.disabled", "&:hover": { color: "error.main" } }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            );
          })
        )}
        
        {hasMore && (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Button 
              size="small" 
              onClick={() => fetchNotifications(activeTab, page + 1, true)}
              disabled={loading}
              sx={{ textTransform: "none" }}
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          </Box>
        )}
      </Box>
    </Menu>
  );
};

export default NotificationPanel;
