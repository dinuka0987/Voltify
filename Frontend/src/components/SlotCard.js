import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import EvStationIcon from "@mui/icons-material/EvStation";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@mui/material";

const SlotCard = ({ slot, onBook, onSelect, isAdmin }) => {
  const statusMap = {
    available: { label: "Available", color: "success", dotClass: "ev-status-dot--active" },
    occupied: { label: "Occupied", color: "error", dotClass: "ev-status-dot--inactive" },
    maintenance: { label: "Maintenance", color: "warning", dotClass: "ev-status-dot--warning" },
  };

  const status = statusMap[slot.status] || statusMap.maintenance;

  return (
    <Card
      className="ev-premium-card"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                bgcolor: "rgba(59, 130, 246, 0.1)",
                color: "#3b82f6",
              }}
            >
              <LocalParkingIcon sx={{ fontSize: 22 }} />
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
                Slot {slot.slotNumber}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Box className={`ev-status-dot ${status.dotClass}`} sx={{ width: 6, height: 6, "&::after": { display: "none" } }} />
                {status.label}
              </Box>
            }
            color={status.color}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 700, borderRadius: 2, fontSize: "0.75rem" }}
          />
        </Box>

        <Grid container spacing={1.5} sx={{ mt: 2.5 }}>
          <Grid item xs={6}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "background.default",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                Vehicle Type
              </Typography>
              <Typography sx={{ fontWeight: 700, textTransform: "capitalize", fontSize: "0.9rem", mt: 0.25 }}>
                {slot.vehicleType || "Any"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "background.default",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                Charging
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                {slot.isChargingEnabled ? (
                  <ElectricBoltIcon sx={{ fontSize: 16, color: "#10b981" }} />
                ) : (
                  <EvStationIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                )}
                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                  {slot.isChargingEnabled ? `${slot.chargingPower} kW` : "Off"}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      {!isAdmin && (
        <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
          <Button
            variant="contained"
            disabled={slot.status !== "available"}
            onClick={() => onBook(slot._id)}
            fullWidth
            sx={{
              py: 1.2,
              borderRadius: 2.5,
              fontSize: "0.85rem",
              ...(slot.status === "available" && {
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
                  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
                },
              }),
            }}
          >
            {slot.status === "available" ? "⚡ Book Now" : "Not Available"}
          </Button>
        </CardActions>
      )}

      {isAdmin && (
        <CardActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onSelect(slot._id)}
            sx={{ flex: 1, borderRadius: 2 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            onClick={() => onSelect(slot._id, "delete")}
            sx={{ flex: 1, borderRadius: 2 }}
          >
            Delete
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default SlotCard;
