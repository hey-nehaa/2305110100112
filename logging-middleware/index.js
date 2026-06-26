// use proxy in browser, direct url in node
const isBrowser = typeof window !== "undefined";
const BASE_URL = isBrowser ? "/api" : "http://4.224.186.213/evaluation-service";

const VALID_STACKS = ["backend", "frontend"];
const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"];
const VALID_PACKAGES = [
  "cache", "controller", "cron_job", "db", "domain", "handler",
  "repository", "route", "service",
  "api", "component", "hook", "page", "state", "style",
  "auth", "config", "middleware", "utils",
];

let authToken = null;
let tokenExpiry = 0;
let creds = null;

export function initLogger(credentials) {
  creds = credentials;
}

async function getToken() {
  if (authToken && Date.now() / 1000 < tokenExpiry) return authToken;

  if (!creds) throw new Error("call initLogger() first");

  const res = await fetch(`${BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(creds),
  });

  if (!res.ok) throw new Error("auth failed: " + res.status);

  const data = await res.json();
  authToken = data.access_token;
  tokenExpiry = data.expires_in;
  return authToken;
}

export async function Log(stack, level, pkg, message) {
  if (!VALID_STACKS.includes(stack) || !VALID_LEVELS.includes(level) || !VALID_PACKAGES.includes(pkg)) {
    console.error("[logger] invalid params:", { stack, level, pkg });
    return;
  }

  try {
    const token = await getToken();
    await fetch(`${BASE_URL}/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });
  } catch (err) {
    console.error("[logger]", err.message);
  }
}
