import AddIcon from "@mui/icons-material/Add";
import GridViewIcon from "@mui/icons-material/GridView";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import SlotCard from "../../components/SlotCard";
import API from "../../services/api";
import socket from "../../socket";

const emptySlot = {
  slotNumber: "",
  vehicleType: "",
  isChargingEnabled: true,
  chargingPower: 7.4,
};

const SlotManagement = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(emptySlot);

  const fetchSlots = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get("/slots");
      setSlots(response.data);
    } catch (err) {
      setError("Failed to load slots");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Real-time socket listeners
  useEffect(() => {
    const handleSlotUpdated = () => {
      fetchSlots();
    };

    socket.on("slot-updated", handleSlotUpdated);
    socket.on("booking-created", handleSlotUpdated);
    socket.on("booking-ended", handleSlotUpdated);

    return () => {
      socket.off("slot-updated", handleSlotUpdated);
      socket.off("booking-created", handleSlotUpdated);
      socket.off("booking-ended", handleSlotUpdated);
    };
  }, [fetchSlots]);

  const handleOpenDialog = () => {
    setIsEditing(false);
    setFormData(emptySlot);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        level: formData.level || 1,
        vehicleType: formData.vehicleType || undefined,
      };

      if (isEditing) {
        await API.put(`/slots/${formData._id}`, payload);
        setSuccess("Slot updated successfully");
      } else {
        await API.post("/slots", payload);
        setSuccess("Slot created successfully");
      }
      handleCloseDialog();
      fetchSlots();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save slot");
    }
  };

  const handleDelete = async (slotId) => {
    if (window.confirm("Are you sure you want to delete this slot?")) {
      try {
        await API.delete(`/slots/${slotId}`);
        setSuccess("Slot deleted successfully");
        fetchSlots();
        setTimeout(() => setSuccess(""), 2000);
      } catch (err) {
        setError("Failed to delete slot");
      }
    }
  };

  const handleSelect = (slotId, action = "edit") => {
    if (action === "delete") {
      handleDelete(slotId);
      return;
    }

    const slot = slots.find((s) => s._id === slotId);
    if (slot) {
      setFormData({ ...slot, vehicleType: slot.vehicleType || "" });
      setIsEditing(true);
      setOpenDialog(true);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }} className="ev-page">
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
              bgcolor: "rgba(34, 197, 94, 0.1)",
              color: "#22c55e",
            }}
          >
            <GridViewIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography sx={{ color: "primary.main", fontWeight: 700, fontSize: "0.85rem" }}>
              Admin tools
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  fontSize: { xs: "1.4rem", sm: "1.7rem" },
                }}
              >
                Slot Management
              </Typography>
              <Chip
                label={slots.length}
                size="small"
                sx={{
                  fontWeight: 800,
                  bgcolor: "rgba(34, 197, 94, 0.1)",
                  color: "#22c55e",
                  minWidth: 32,
                }}
              />
            </Box>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ borderRadius: 2.5 }}
        >
          Add Slot
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2.5 }}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {slots.map((slot, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={slot._id}
              sx={{ animation: `ev-slideUp 400ms ease-out ${index * 60}ms both` }}
            >
              <SlotCard slot={slot} onSelect={handleSelect} isAdmin />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {isEditing ? "Edit Slot" : "Add New Slot"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Slot Number"
            name="slotNumber"
            value={formData.slotNumber}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            select
            fullWidth
            label="Vehicle Type"
            name="vehicleType"
            value={formData.vehicleType || ""}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="sedan">Sedan</MenuItem>
            <MenuItem value="suv">SUV</MenuItem>
            <MenuItem value="hatchback">Hatchback</MenuItem>
            <MenuItem value="truck">Truck</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Charging Power (kW)"
            name="chargingPower"
            type="number"
            value={formData.chargingPower}
            onChange={handleChange}
            margin="normal"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2 }}>
            {isEditing ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SlotManagement;
