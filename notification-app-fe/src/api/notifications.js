import { Log } from "logging-middleware";

const BASE = "/api";

let token = null;
let expiry = 0;

const creds = {
  email: "neha.kumari2023@glbajajgroup.org",
  name: "Neha Kumari",
  rollNo: "2305110100112",
  accessCode: "xxkJnk",
  clientID: "86e346f6-e68b-4f94-bed3-cdefb4b6a8f7",
  clientSecret: "xKYFtjTgWehgdFXy",
};

async function getToken() {
  if (token && Date.now() / 1000 < expiry) return token;

  Log("frontend", "debug", "api", "refreshing auth token");
  const res = await fetch(`${BASE}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(creds),
  });
  if (!res.ok) {
    Log("frontend", "error", "api", "auth failed " + res.status);
    throw new Error("auth failed");
  }
  const d = await res.json();
  token = d.access_token;
  expiry = d.expires_in;
  return token;
}

export async function fetchNotifications({ limit, type } = {}) {
  Log("frontend", "info", "api", `fetchNotifications limit=${limit || "all"} type=${type || "all"}`);

  const t = await getToken();
  const params = new URLSearchParams();
  if (limit) params.set("limit", limit);
  if (type) params.set("notification_type", type);

  const qs = params.toString();
  const res = await fetch(`${BASE}/notifications${qs ? "?" + qs : ""}`, {
    headers: { Authorization: `Bearer ${t}` },
  });

  if (!res.ok) {
    Log("frontend", "error", "api", "failed to get notifications: " + res.status);
    throw new Error("could not load notifications");
  }

  const data = await res.json();
  Log("frontend", "debug", "api", `received ${data.notifications?.length ?? 0} items`);
  return data.notifications || [];
}
