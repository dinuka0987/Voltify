import React, { useCallback, useEffect, useState } from "react";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SecurityIcon from "@mui/icons-material/Security";
import WarningIcon from "@mui/icons-material/Warning";
import SaveIcon from "@mui/icons-material/Save";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import BadgeIcon from "@mui/icons-material/Badge";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import EvStationIcon from "@mui/icons-material/EvStation";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

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

const SettingsPage = ({ colorMode, onToggleColorMode }) => {
  const role = localStorage.getItem("role") || "user";
  const isAdmin = role === "admin";
  const isDark = colorMode === "dark";
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Security form state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get("/auth/profile");
      const data = response.data;
      
      // Initialize default preferences if they don't exist
      if (!data.preferences) {
        data.preferences = {
          notifications: { email: true, push: true, sms: false },
          privacyMode: "private"
        };
      }
      
      setProfile(data);
      setFormData(data);
    } catch (err) {
      showMessage("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = async (category, field, value) => {
    try {
      setLoading(true);
      const newPreferences = { ...formData.preferences };
      
      if (category === "notifications") {
        newPreferences.notifications = { ...newPreferences.notifications, [field]: value };
      } else {
        newPreferences[field] = value;
      }

      await API.put("/auth/preferences", { preferences: newPreferences });
      
      setFormData(prev => ({ ...prev, preferences: newPreferences }));
      setProfile(prev => ({ ...prev, preferences: newPreferences }));
      showMessage("Preferences saved successfully");
    } catch (err) {
      showMessage("Failed to update preferences", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await API.put("/auth/profile", formData);
      const response = await API.get("/auth/profile");
      setProfile(response.data);
      setFormData(response.data);
      localStorage.setItem("name", response.data.name || "User");
      showMessage("Profile updated successfully");
      setEditingProfile(false);
    } catch (err) {
      showMessage("Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage("New passwords do not match", "error");
      return;
    }
    try {
      setLoading(true);
      await API.put("/auth/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      showMessage("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to change password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    window.location.href = "/login";
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await API.delete("/auth/account");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      window.location.href = "/login";
    } catch (err) {
      showMessage("Failed to delete account", "error");
      setDeleteDialogOpen(false);
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} className="ev-page">
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ color: isAdmin ? "secondary.main" : "primary.main", fontWeight: 800 }}>
          {isAdmin ? "Admin Controls" : "User Management"}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>
          Settings
        </Typography>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, height: "100%", minHeight: 650 }}>
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <Tabs
                orientation="vertical"
                value={tabValue}
                onChange={(e, v) => setTabValue(v)}
                sx={{
                  "& .MuiTabs-indicator": {
                    left: 0,
                    right: "auto",
                    width: 4,
                    borderRadius: "0 4px 4px 0",
                  },
                  "& .MuiTab-root": {
                    alignItems: "center",
                    justifyContent: "flex-start",
                    textAlign: "left",
                    px: 3,
                    py: 2.5,
                    minHeight: 60,
                    fontWeight: 700,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    transition: "all 0.2s ease",
                  },
                  "& .Mui-selected": {
                    bgcolor: isDark ? "rgba(59, 130, 246, 0.08)" : "rgba(59, 130, 246, 0.04)",
                    color: "primary.main",
                  }
                }}
              >
                <Tab icon={<PersonIcon sx={{ mr: 2 }} />} iconPosition="start" label="Profile" />
                <Tab icon={<SettingsIcon sx={{ mr: 2 }} />} iconPosition="start" label="Preferences" />
                <Tab icon={<SecurityIcon sx={{ mr: 2 }} />} iconPosition="start" label="Security" />
              </Tabs>
              <Box sx={{ mt: "auto", p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                <Button 
                  fullWidth 
                  color="inherit" 
                  variant="outlined" 
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{ 
                    borderRadius: 2, 
                    justifyContent: "center", 
                    px: 2, 
                    py: 1.2,
                    borderWidth: 1.5,
                    fontWeight: 700,
                    borderColor: "divider",
                    "&:hover": { borderWidth: 1.5, borderColor: "primary.main", color: "primary.main" }
                  }}
                >
                  Log Out
                </Button>
                <Button 
                  fullWidth 
                  color="error" 
                  variant="outlined" 
                  startIcon={<DeleteForeverIcon />}
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{ 
                    borderRadius: 2, 
                    justifyContent: "center", 
                    px: 2, 
                    py: 1.2,
                    borderWidth: 1.5,
                    fontWeight: 700,
                    "&:hover": { borderWidth: 1.5 }
                  }}
                >
                  Delete Account
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={9}>
          <Card sx={{ borderRadius: 3, minHeight: 650, height: "100%" }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              
              {/* TAB 1: PROFILE */}
              <TabPanel value={tabValue} index={0} sx={{ pt: 0 }}>
                {profile && (
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 4, pb: 3, borderBottom: "1px solid", borderColor: "divider" }}>
                      <Avatar
                        sx={{
                          width: 80, height: 80, fontSize: 32, fontWeight: 800,
                          background: isAdmin ? "linear-gradient(135deg, #2563eb, #60a5fa)" : "linear-gradient(135deg, #22c55e, #10b981)",
                          boxShadow: "0 8px 24px rgba(34, 197, 94, 0.25)",
                        }}
                      >
                        {(profile.name || "U").charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
                          {profile.name}
                        </Typography>
                        <Typography sx={{ color: "text.secondary" }}>{profile.email}</Typography>
                        <Box sx={{ mt: 1, display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.5, py: 0.5, borderRadius: 2, bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}>
                          {isAdmin ? <LocalParkingIcon sx={{ fontSize: 16 }} /> : <EvStationIcon sx={{ fontSize: 16 }} />}
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {isAdmin ? "Parking Owner" : "EV Driver"}
                          </Typography>
                        </Box>
                      </Box>
                      {!editingProfile ? (
                        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditingProfile(true)} sx={{ borderRadius: 2 }}>
                          Edit Profile
                        </Button>
                      ) : (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveProfile} disabled={loading} sx={{ borderRadius: 2 }}>
                            Save
                          </Button>
                          <Button variant="outlined" startIcon={<CloseIcon />} onClick={() => { setEditingProfile(false); setFormData(profile); }} sx={{ borderRadius: 2 }}>
                            Cancel
                          </Button>
                        </Box>
                      )}
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Full Name" name="name" value={formData.name || ""} onChange={handleProfileChange} disabled={!editingProfile} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Email" name="email" value={formData.email || ""} disabled helperText="Email cannot be changed" />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Phone" name="phone" value={formData.phone || ""} onChange={handleProfileChange} disabled={!editingProfile} />
                      </Grid>

                      {!isAdmin && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Vehicle Number" name="vehicleNumber" value={formData.vehicleNumber || ""} onChange={handleProfileChange} disabled={!editingProfile} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth disabled={!editingProfile}>
                              <InputLabel>Vehicle Type</InputLabel>
                              <Select name="vehicleType" value={formData.vehicleType || ""} label="Vehicle Type" onChange={handleProfileChange}>
                                <MenuItem value="">Any</MenuItem>
                                <MenuItem value="sedan">Sedan</MenuItem>
                                <MenuItem value="suv">SUV</MenuItem>
                                <MenuItem value="hatchback">Hatchback</MenuItem>
                                <MenuItem value="truck">Truck</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Box>
                )}
              </TabPanel>

              {/* TAB 2: PREFERENCES */}
              <TabPanel value={tabValue} index={1} sx={{ pt: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Appearance</Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, mb: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: isDark ? "#17233a" : "#eaf3ff", color: isDark ? "#f7c948" : "primary.main" }}>
                      {isDark ? <DarkModeIcon /> : <LightModeIcon />}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 800 }}>Dark Mode</Typography>
                      <Typography color="text.secondary" variant="body2">Switch between light and dark UI themes.</Typography>
                    </Box>
                  </Box>
                  <Switch checked={isDark} onChange={onToggleColorMode} />
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Notification Settings</Typography>
                <Box sx={{ display: "grid", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>Booking Notifications</Typography>
                      <Typography color="text.secondary" variant="body2">Alerts for confirmed and cancelled bookings.</Typography>
                    </Box>
                    <Switch 
                      checked={formData.preferences?.notifications?.bookings ?? true} 
                      onChange={(e) => handlePreferenceChange("notifications", "bookings", e.target.checked)} 
                    />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>Charging Notifications</Typography>
                      <Typography color="text.secondary" variant="body2">Updates when charging starts and ends.</Typography>
                    </Box>
                    <Switch 
                      checked={formData.preferences?.notifications?.charging ?? true} 
                      onChange={(e) => handlePreferenceChange("notifications", "charging", e.target.checked)} 
                    />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>Payment Notifications</Typography>
                      <Typography color="text.secondary" variant="body2">Receipts and payment confirmations.</Typography>
                    </Box>
                    <Switch 
                      checked={formData.preferences?.notifications?.payments ?? true} 
                      onChange={(e) => handlePreferenceChange("notifications", "payments", e.target.checked)} 
                    />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>System Announcements</Typography>
                      <Typography color="text.secondary" variant="body2">Important system news and maintenance alerts.</Typography>
                    </Box>
                    <Switch 
                      checked={formData.preferences?.notifications?.system ?? true} 
                      onChange={(e) => handlePreferenceChange("notifications", "system", e.target.checked)} 
                    />
                  </Box>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, color: "text.secondary", textTransform: "uppercase" }}>Delivery Methods</Typography>
                  
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>Email Notifications</Typography>
                      <Typography color="text.secondary" variant="body2">Receive booking updates and receipts via email.</Typography>
                    </Box>
                    <Switch 
                      checked={formData.preferences?.notifications?.email || false} 
                      onChange={(e) => handlePreferenceChange("notifications", "email", e.target.checked)} 
                    />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>Push Notifications</Typography>
                      <Typography color="text.secondary" variant="body2">Receive real-time alerts in your browser.</Typography>
                    </Box>
                    <Switch 
                      checked={formData.preferences?.notifications?.push || false} 
                      onChange={(e) => handlePreferenceChange("notifications", "push", e.target.checked)} 
                    />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>SMS Alerts</Typography>
                      <Typography color="text.secondary" variant="body2">Receive urgent maintenance updates via SMS.</Typography>
                    </Box>
                    <Switch 
                      checked={formData.preferences?.notifications?.sms || false} 
                      onChange={(e) => handlePreferenceChange("notifications", "sms", e.target.checked)} 
                    />
                  </Box>
                </Box>
              </TabPanel>

              {/* TAB 3: SECURITY & PRIVACY */}
              <TabPanel value={tabValue} index={2} sx={{ pt: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Change Password</Typography>
                <form onSubmit={handleChangePassword}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField 
                        fullWidth type="password" label="Current Password" required
                        value={passwordForm.currentPassword} 
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} 
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        fullWidth type="password" label="New Password" required
                        value={passwordForm.newPassword} 
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        fullWidth type="password" label="Confirm New Password" required
                        value={passwordForm.confirmPassword} 
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                        error={passwordForm.confirmPassword !== "" && passwordForm.newPassword !== passwordForm.confirmPassword}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" disabled={loading} sx={{ borderRadius: 2 }}>
                        Update Password
                      </Button>
                    </Grid>
                  </Grid>
                </form>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Privacy Controls</Typography>
                <Box sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>Account Visibility</Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>
                    Determine how your profile information is shared within the Voltify network.
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Privacy Mode</InputLabel>
                    <Select 
                      value={formData.preferences?.privacyMode || "private"} 
                      label="Privacy Mode"
                      onChange={(e) => handlePreferenceChange("privacyMode", "privacyMode", e.target.value)}
                    >
                      <MenuItem value="public">Public (Visible to network)</MenuItem>
                      <MenuItem value="private">Private (Restricted visibility)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </TabPanel>

            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Account Deletion Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: "error.main", display: "flex", alignItems: "center", gap: 1 }}>
          <WarningIcon /> Permanently Delete Account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2, fontWeight: 600 }}>
            This action cannot be undone. All your bookings, charging sessions, and personal data will be permanently erased.
          </DialogContentText>
          <DialogContentText>
            Are you absolutely sure you want to delete your account?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} variant="contained" color="error" disabled={loading} sx={{ borderRadius: 2 }}>
            {loading ? "Deleting..." : "Yes, Delete My Account"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SettingsPage;
