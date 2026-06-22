import React, { useState, useEffect, useCallback } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import API from "../../services/api";

const Maintenance = () => {
  const [records, setRecords] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    slotId: "",
    issueDescription: "",
    status: "reported",
    notes: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [maintRes, slotsRes] = await Promise.all([
        API.get("/maintenance"),
        API.get("/slots")
      ]);
      setRecords(maintRes.data);
      setSlots(slotsRes.data);
    } catch (err) {
      setError("Failed to load maintenance data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = (record = null) => {
    if (record) {
      setEditingId(record._id);
      setFormData({
        slotId: record.slotId?._id || "",
        issueDescription: record.issueDescription,
        status: record.status,
        notes: record.notes || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        slotId: "",
        issueDescription: "",
        status: "reported",
        notes: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        await API.put(`/maintenance/${editingId}`, formData);
        setSuccess("Record updated successfully");
      } else {
        await API.post("/maintenance", formData);
        setSuccess("Maintenance record created successfully");
      }
      handleCloseDialog();
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save record");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this maintenance record?")) {
      try {
        setLoading(true);
        await API.delete(`/maintenance/${id}`);
        setSuccess("Record deleted");
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError("Failed to delete record");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} className="ev-page">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
            <BuildIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography sx={{ color: "#f59e0b", fontWeight: 700, fontSize: "0.85rem" }}>
              Operations
            </Typography>
            <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>
              Maintenance
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2, bgcolor: "#f59e0b", "&:hover": { bgcolor: "#d97706" } }}
        >
          Report Issue
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2.5 }}>{success}</Alert>}

      <Card className="ev-premium-card" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Slot</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Issue Description</TableCell>
                  <TableCell>Reported On</TableCell>
                  <TableCell>Resolved On</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No maintenance records found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Slot {record.slotId?.slotNumber || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.status.toUpperCase()}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            borderRadius: 2,
                            bgcolor: 
                              record.status === "resolved" ? "rgba(16, 185, 129, 0.1)" :
                              record.status === "in-progress" ? "rgba(34, 197, 94, 0.1)" :
                              "rgba(244, 63, 94, 0.1)",
                            color: 
                              record.status === "resolved" ? "#10b981" :
                              record.status === "in-progress" ? "#22c55e" :
                              "#f43f5e",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 250, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {record.issueDescription}
                      </TableCell>
                      <TableCell>{new Date(record.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{record.resolvedDate ? new Date(record.resolvedDate).toLocaleDateString() : "-"}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => handleOpenDialog(record)}>
                          <EditIcon fontSize="small" />
                        </Button>
                        <Button size="small" color="error" onClick={() => handleDelete(record._id)}>
                          <DeleteIcon fontSize="small" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
            {editingId ? "Update Maintenance Record" : "Report Faulty Charger"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "grid", gap: 2.5, pt: 1 }}>
              <FormControl fullWidth required disabled={!!editingId}>
                <InputLabel>Target Slot / Charger</InputLabel>
                <Select
                  value={formData.slotId}
                  label="Target Slot / Charger"
                  onChange={(e) => setFormData({ ...formData, slotId: e.target.value })}
                >
                  {slots.map((slot) => (
                    <MenuItem key={slot._id} value={slot._id}>
                      Slot {slot.slotNumber} ({slot.status})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="Issue Description"
                fullWidth
                required
                multiline
                rows={3}
                value={formData.issueDescription}
                onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
              />
              
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="reported">Reported</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Resolution Notes"
                fullWidth
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Details of the repair/fix (optional)"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog} variant="outlined" sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading} sx={{ borderRadius: 2, bgcolor: "#f59e0b", "&:hover": { bgcolor: "#d97706" } }}>
              {loading ? "Saving..." : "Save Record"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Maintenance;
