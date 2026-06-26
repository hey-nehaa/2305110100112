import { useState, useEffect, useCallback } from "react";
import { fetchNotifications } from "../api/notifications";
import { Log } from "logging-middleware";

export function useNotifications(limit, type) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications({ limit, type });
      setNotifications(data);
    } catch (e) {
      Log("frontend", "error", "hook", e.message);
      setError(e.message);
    }
    setLoading(false);
  }, [limit, type]);

  useEffect(() => { load(); }, [load]);

  return { notifications, loading, error, refetch: load };
}
