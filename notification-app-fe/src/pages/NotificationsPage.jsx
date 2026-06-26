import { useState } from "react";
import {
  Alert, Badge, Box, CircularProgress,
  Divider, Stack, Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";
import { Log } from "logging-middleware";

const VIEWED_KEY = "viewedNotifications";

function getViewed() {
  try {
    return JSON.parse(localStorage.getItem(VIEWED_KEY)) || [];
  } catch { return []; }
}

function markViewed(id) {
  const viewed = getViewed();
  if (!viewed.includes(id)) {
    viewed.push(id);
    localStorage.setItem(VIEWED_KEY, JSON.stringify(viewed));
  }
}

export function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [viewed, setViewed] = useState(getViewed());

  const type = filter === "All" ? undefined : filter;
  const { notifications, loading, error } = useNotifications(undefined, type);

  const unreadCount = notifications.filter(n => !viewed.includes(n.ID)).length;

  const handleFilterChange = (val) => {
    setFilter(val);
    Log("frontend", "info", "page", `filter changed to ${val}`);
  };

  const handleMarkRead = (id) => {
    markViewed(id);
    setViewed([...getViewed()]);
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", px: 2, py: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsIcon sx={{ fontSize: 28 }} />
        </Badge>
        <Typography variant="h5" fontWeight={700}>
          All Notifications
        </Typography>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Box mb={2}>
        <NotificationFilter value={filter} onChange={handleFilterChange} />
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error">Failed to load: {error}</Alert>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info">No notifications found</Alert>
      )}

      {!loading && !error && notifications.length > 0 && (
        <Stack spacing={1.5}>
          {notifications.map((n) => (
            <NotificationCard
              key={n.ID}
              notification={n}
              isRead={viewed.includes(n.ID)}
              onMarkRead={handleMarkRead}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
