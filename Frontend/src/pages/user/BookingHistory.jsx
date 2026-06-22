import HistoryIcon from "@mui/icons-material/History";
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
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import API from "../../services/api";
import socket from "../../socket";

const UserBookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [endBookingDialog, setEndBookingDialog] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get("/bookings/user/bookings");
      setBookings(response.data);
    } catch (err) {
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Real-time socket listeners
  useEffect(() => {
    const handleUpdate = () => {
      fetchBookings();
    };

    socket.on("booking-created", handleUpdate);
    socket.on("booking-ended", handleUpdate);

    return () => {
      socket.off("booking-created", handleUpdate);
      socket.off("booking-ended", handleUpdate);
    };
  }, [fetchBookings]);

  const handleEndBooking = (booking) => {
    setSelectedBooking(booking);
    setEndBookingDialog(true);
  };

  const confirmEndBooking = async () => {
    try {
      await API.put(`/bookings/${selectedBooking._id}/end`, {});
      setEndBookingDialog(false);
      fetchBookings();
    } catch (err) {
      setError("Failed to end booking");
    }
  };

  const getStatusStyle = (status) => {
    if (status === "active") return { bgcolor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", borderColor: "rgba(59, 130, 246, 0.2)" };
    if (status === "completed") return { bgcolor: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.2)" };
    return { bgcolor: "rgba(244, 63, 94, 0.1)", color: "#f43f5e", borderColor: "rgba(244, 63, 94, 0.2)" };
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} className="ev-page">
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: "rgba(59, 130, 246, 0.1)",
            color: "#3b82f6",
          }}
        >
          <HistoryIcon sx={{ fontSize: 24 }} />
        </Avatar>
        <Box>
          <Typography sx={{ color: "primary.main", fontWeight: 700, fontSize: "0.85rem" }}>
            Booking history
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: { xs: "1.4rem", sm: "1.7rem" },
            }}
          >
            My Bookings
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {bookings.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2.5 }}>No bookings yet</Alert>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
            overflow: "auto",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Slot</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Parking</TableCell>
                <TableCell>Charging</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => {
                const statusStyle = getStatusStyle(booking.status);
                return (
                  <TableRow key={booking._id}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                        {booking.slotId?.slotNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.85rem" }}>
                        {new Date(booking.startTime).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.85rem" }}>
                        {booking.endTime
                          ? new Date(booking.endTime).toLocaleString()
                          : "Ongoing"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                        {booking.duration ? `${booking.duration} min` : "Active"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.85rem" }}>
                        ${booking.parkingCost?.toFixed(2) || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.85rem" }}>
                        ${booking.chargingCost?.toFixed(2) || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#10b981" }}>
                        ${booking.totalCost?.toFixed(2) || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={booking.status}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: 700,
                          borderRadius: 2,
                          textTransform: "capitalize",
                          ...statusStyle,
                          border: "1px solid",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {booking.status === "active" && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleEndBooking(booking)}
                          sx={{ borderRadius: 2, fontSize: "0.75rem" }}
                        >
                          End
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* End Booking Dialog */}
      <Dialog
        open={endBookingDialog}
        onClose={() => setEndBookingDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          End Booking
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "text.secondary" }}>
            Are you sure you want to end this booking? The final cost will be
            calculated based on usage.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setEndBookingDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmEndBooking}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #f43f5e, #e11d48)",
              "&:hover": {
                background: "linear-gradient(135deg, #fb7185, #f43f5e)",
              },
            }}
          >
            End Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserBookingHistory;
