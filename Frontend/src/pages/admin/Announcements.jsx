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
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import API from "../../services/api";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "update",
    isActive: true,
  });

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/announcements");
      setAnnouncements(res.data);
    } catch (err) {
      setError("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleOpenDialog = (announcement = null) => {
    if (announcement) {
      setEditingId(announcement._id);
      setFormData({
        title: announcement.title,
        message: announcement.message,
        type: announcement.type,
        isActive: announcement.isActive,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        message: "",
        type: "update",
        isActive: true,
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
        await API.put(`/announcements/${editingId}`, formData);
        setSuccess("Announcement updated successfully");
      } else {
        await API.post("/announcements", formData);
        setSuccess("Announcement created successfully");
      }
      handleCloseDialog();
      fetchAnnouncements();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        setLoading(true);
        await API.delete(`/announcements/${id}`);
        setSuccess("Announcement deleted");
        fetchAnnouncements();
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError("Failed to delete announcement");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} className="ev-page">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
            <CampaignIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography sx={{ color: "#22c55e", fontWeight: 700, fontSize: "0.85rem" }}>
              Communications
            </Typography>
            <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>
              Announcements
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          New Announcement
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
                  <TableCell>Status</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && announcements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : announcements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No announcements found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  announcements.map((announcement) => (
                    <TableRow key={announcement._id}>
                      <TableCell>
                        <Chip
                          label={announcement.isActive ? "Active" : "Inactive"}
                          color={announcement.isActive ? "success" : "default"}
                          size="small"
                          sx={{ fontWeight: 700, borderRadius: 2 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={announcement.type.toUpperCase()}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            borderRadius: 2,
                            bgcolor: announcement.type === "maintenance" ? "rgba(245, 158, 11, 0.1)" : "rgba(34, 197, 94, 0.1)",
                            color: announcement.type === "maintenance" ? "#f59e0b" : "#22c55e",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{announcement.title}</TableCell>
                      <TableCell sx={{ maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {announcement.message}
                      </TableCell>
                      <TableCell>{new Date(announcement.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => handleOpenDialog(announcement)}>
                          <EditIcon fontSize="small" />
                        </Button>
                        <Button size="small" color="error" onClick={() => handleDelete(announcement._id)}>
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
            {editingId ? "Edit Announcement" : "Create Announcement"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "grid", gap: 2.5, pt: 1 }}>
              <TextField
                label="Title"
                fullWidth
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="update">General Update</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="offer">Offer/Promo</MenuItem>
                  <MenuItem value="alert">Alert</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Message"
                fullWidth
                required
                multiline
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Active Status</Typography>
                  <Typography variant="body2" color="text.secondary">Visible to users in notification bell</Typography>
                </Box>
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  color="success"
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog} variant="outlined" sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading} sx={{ borderRadius: 2 }}>
              {loading ? "Saving..." : "Save Announcement"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Announcements;
