import PaidIcon from "@mui/icons-material/Paid";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import TuneIcon from "@mui/icons-material/Tune";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
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
    TextField,
    Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import API from "../../services/api";

const ChargingRates = () => {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get("/charging/rates");
      setRates(response.data);
      setFormData(response.data);
    } catch (err) {
      setError("Failed to load rates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

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
      await API.put("/charging/rates", formData);
      setMessage("Rates updated successfully");
      setEditing(false);
      fetchRates();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to update rates");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !rates) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }} className="ev-page">
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: "rgba(245, 158, 11, 0.1)",
              color: "#f59e0b",
            }}
          >
            <PaidIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography sx={{ color: "warning.main", fontWeight: 700, fontSize: "0.85rem" }}>
              Pricing configuration
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800,
                fontSize: { xs: "1.4rem", sm: "1.7rem" },
              }}
            >
              Charging & Parking Rates
            </Typography>
          </Box>
        </Box>

        {!editing ? (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setEditing(true)}
            sx={{ borderRadius: 2 }}
          >
            Edit Rates
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
                setFormData(rates);
              }}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
          </Box>
        )}
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

      {rates && (
        <Grid container spacing={2.5}>
          {/* Base Rates Card */}
          <Grid item xs={12} sx={{ animation: "ev-slideUp 400ms ease-out both" }}>
            <Card>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "rgba(34, 197, 94, 0.1)",
                      color: "#22c55e",
                    }}
                  >
                    <LocalParkingIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "1.05rem",
                    }}
                  >
                    Base Rates
                  </Typography>
                </Box>

                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Parking Rate ($/hour)"
                      name="parkingRatePerHour"
                      type="number"
                      value={formData.parkingRatePerHour || ""}
                      onChange={handleChange}
                      disabled={!editing}
                      inputProps={{ step: "0.01" }}
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1, color: "text.secondary" }}>
                            <LocalParkingIcon sx={{ fontSize: 18 }} />
                          </Box>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Charging Rate ($/kWh)"
                      name="chargingRatePerKWh"
                      type="number"
                      value={formData.chargingRatePerKWh || ""}
                      onChange={handleChange}
                      disabled={!editing}
                      inputProps={{ step: "0.01" }}
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1, color: "text.secondary" }}>
                            <ElectricBoltIcon sx={{ fontSize: 18 }} />
                          </Box>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Min. Parking Charge ($)"
                      name="minimumParkingCharge"
                      type="number"
                      value={formData.minimumParkingCharge || ""}
                      onChange={handleChange}
                      disabled={!editing}
                      inputProps={{ step: "0.01" }}
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1, color: "text.secondary" }}>
                            <PaidIcon sx={{ fontSize: 18 }} />
                          </Box>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Peak Hour Card */}
          <Grid item xs={12} sx={{ animation: "ev-slideUp 400ms ease-out 150ms both" }}>
            <Card>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "rgba(245, 158, 11, 0.1)",
                      color: "#f59e0b",
                    }}
                  >
                    <AccessTimeIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "1.05rem",
                      }}
                    >
                      Peak Hour Configuration
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                      Higher rates applied during peak hours
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Peak Start (HH:MM)"
                      name="peakHourStart"
                      value={formData.peakHourStart || ""}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="08:00"
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1, color: "text.secondary" }}>
                            <AccessTimeIcon sx={{ fontSize: 18 }} />
                          </Box>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Peak End (HH:MM)"
                      name="peakHourEnd"
                      value={formData.peakHourEnd || ""}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="18:00"
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1, color: "text.secondary" }}>
                            <AccessTimeIcon sx={{ fontSize: 18 }} />
                          </Box>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Price Multiplier"
                      name="peakHourMultiplier"
                      type="number"
                      value={formData.peakHourMultiplier || ""}
                      onChange={handleChange}
                      disabled={!editing}
                      inputProps={{ step: "0.1" }}
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1, color: "text.secondary" }}>
                            <TuneIcon sx={{ fontSize: 18 }} />
                          </Box>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default ChargingRates;
