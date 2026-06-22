import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import BadgeIcon from "@mui/icons-material/Badge";
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
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import API from "../../services/api";

const UserProfile = () => {
  const role = localStorage.getItem("role") || "user";
  const isAdmin = role === "admin";
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get("/auth/profile");
      setProfile(response.data);
      setFormData(response.data);
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await API.put("/auth/profile", formData);
      const response = await API.get("/auth/profile");
      setProfile(response.data);
      setFormData(response.data);
      localStorage.setItem("name", response.data.name || "User");
      setMessage("Profile updated successfully");
      setEditing(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to update profile");
    } finally {
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
    <Container maxWidth="md" sx={{ py: 4 }} className="ev-page">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ color: isAdmin ? "secondary.main" : "primary.main", fontWeight: 700, fontSize: "0.85rem" }}>
          Account settings
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: { xs: "1.4rem", sm: "1.7rem" },
          }}
        >
          {isAdmin ? "Owner Profile" : "My Profile"}
        </Typography>
      </Box>

      {message && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2.5 }}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {profile && (
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            {/* Profile header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2.5,
                mb: 4,
                pb: 3,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  fontSize: 28,
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  background: isAdmin
                    ? "linear-gradient(135deg, #2563eb, #60a5fa)"
                    : "linear-gradient(135deg, #22c55e, #10b981)",
                  boxShadow: isAdmin
                    ? "0 8px 24px rgba(37, 99, 235, 0.3)"
                    : "0 8px 24px rgba(34, 197, 94, 0.3)",
                }}
              >
                {(profile.name || "U").charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 800,
                    mb: 0.25,
                  }}
                >
                  {profile.name}
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
                  {profile.email}
                </Typography>
                <Box
                  className={isAdmin ? "ev-role-badge ev-role-badge--admin" : "ev-role-badge ev-role-badge--user"}
                  sx={{ mt: 1, display: "inline-flex", alignItems: "center", gap: 0.5 }}
                >
                  {isAdmin ? (
                    <LocalParkingIcon sx={{ fontSize: 14 }} />
                  ) : (
                    <EvStationIcon sx={{ fontSize: 14 }} />
                  )}
                  {isAdmin ? "Parking Owner" : "EV Driver"}
                </Box>
              </Box>

              {/* Edit / Save buttons */}
              {!editing ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setEditing(true)}
                  sx={{ borderRadius: 2 }}
                >
                  Edit
                </Button>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading}
                    sx={{ borderRadius: 2 }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CloseIcon />}
                    onClick={() => {
                      setEditing(false);
                      setFormData(profile);
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>

            {/* Form fields */}
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email || ""}
                  disabled
                  helperText="Email cannot be changed"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Role"
                  value={isAdmin ? "Parking Owner" : "EV Driver"}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Grid>

              {/* Vehicle fields — only shown for EV Drivers */}
              {!isAdmin && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Vehicle Number"
                      name="vehicleNumber"
                      value={formData.vehicleNumber || ""}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Vehicle Type"
                      name="vehicleType"
                      value={formData.vehicleType || ""}
                      onChange={handleChange}
                      disabled={!editing}
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
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default UserProfile;
