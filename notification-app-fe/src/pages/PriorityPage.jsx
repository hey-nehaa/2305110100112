import { useState } from "react";
import {
  Alert, Box, CircularProgress, Divider,
  FormControl, InputLabel, MenuItem, Select,
  Stack, Typography,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";
import { Log } from "logging-middleware";

const typeWeight = { Placement: 3, Result: 2, Event: 1 };

function sortByPriority(notifs) {
  return [...notifs].sort((a, b) => {
    const wDiff = (typeWeight[b.Type] || 0) - (typeWeight[a.Type] || 0);
    if (wDiff !== 0) return wDiff;
    return new Date(b.Timestamp) - new Date(a.Timestamp);
  });
}

const VIEWED_KEY = "viewedNotifications";

function getViewed() {
  try { return JSON.parse(localStorage.getItem(VIEWED_KEY)) || []; }
  catch { return []; }
}
function markViewed(id) {
  const v = getViewed();
  if (!v.includes(id)) {
    v.push(id);
    localStorage.setItem(VIEWED_KEY, JSON.stringify(v));
  }
}

export function PriorityPage() {
  const [filter, setFilter] = useState("All");
  const [limit, setLimit] = useState(10);
  const [viewed, setViewed] = useState(getViewed());

  const type = filter === "All" ? undefined : filter;
  const { notifications, loading, error } = useNotifications(undefined, type);

  // sort by priority then take top N
  const sorted = sortByPriority(notifications);
  const topN = sorted.slice(0, limit);

  const handleFilterChange = (val) => {
    setFilter(val);
    Log("frontend", "info", "page", `priority filter -> ${val}`);
  };

  const handleMarkRead = (id) => {
    markViewed(id);
    setViewed([...getViewed()]);
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", px: 2, py: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
        <StarIcon color="warning" sx={{ fontSize: 28 }} />
        <Typography variant="h5" fontWeight={700}>
          Priority Inbox
        </Typography>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2} alignItems="center">
        <NotificationFilter value={filter} onChange={handleFilterChange} />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Show top</InputLabel>
          <Select
            value={limit}
            label="Show top"
            onChange={(e) => {
              setLimit(e.target.value);
              Log("frontend", "info", "page", `limit changed to ${e.target.value}`);
            }}
          >
            {[5, 10, 15, 20].map(n => (
              <MenuItem key={n} value={n}>{n}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error">{error}</Alert>
      )}

      {!loading && !error && topN.length === 0 && (
        <Alert severity="info">Nothing here</Alert>
      )}

      {!loading && !error && topN.length > 0 && (
        <Stack spacing={1.5}>
          {topN.map((n, i) => (
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
