import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import GradeIcon from "@mui/icons-material/Grade";
import EventIcon from "@mui/icons-material/Event";
import { Log } from "logging-middleware";

const icons = {
  Placement: <WorkIcon fontSize="small" />,
  Result: <GradeIcon fontSize="small" />,
  Event: <EventIcon fontSize="small" />,
};
const colors = { Placement: "success", Result: "info", Event: "warning" };

export function NotificationCard({ notification, isRead, onMarkRead }) {
  const n = notification;

  const handleClick = () => {
    if (!isRead) {
      onMarkRead(n.ID);
      Log("frontend", "info", "component", `marked ${n.ID} as read`);
    }
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        cursor: isRead ? "default" : "pointer",
        bgcolor: isRead ? "background.default" : "action.hover",
        borderLeft: isRead ? "3px solid transparent" : "3px solid",
        borderColor: isRead ? "transparent" : "primary.main",
        "&:hover": { boxShadow: 2 },
      }}
    >
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Chip
            icon={icons[n.Type]}
            label={n.Type}
            size="small"
            color={colors[n.Type] || "default"}
            variant={isRead ? "outlined" : "filled"}
          />
          <Typography variant="caption" color="text.secondary">
            {new Date(n.Timestamp).toLocaleString()}
          </Typography>
        </Stack>
        <Typography variant="body2" fontWeight={isRead ? 400 : 600} mt={0.5}>
          {n.Message}
        </Typography>
      </CardContent>
    </Card>
  );
}
