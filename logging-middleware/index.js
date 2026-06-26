const BASE_URL = "http://4.224.186.213/evaluation-service";

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
  if (authToken && Date.now() / 1000 < tokenExpiry) {
    return authToken;
  }

  if (!creds) {
    throw new Error("Logger not initialized, call initLogger first");
  }

  const res = await fetch(`${BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: creds.email,
      name: creds.name,
      rollNo: creds.rollNo,
      accessCode: creds.accessCode,
      clientID: creds.clientID,
      clientSecret: creds.clientSecret,
    }),
  });

  if (!res.ok) {
    throw new Error(`Auth request failed with status ${res.status}`);
  }

  const data = await res.json();
  authToken = data.access_token;
  tokenExpiry = data.expires_in;
  return authToken;
}

export async function Log(stack, level, pkg, message) {
  if (!VALID_STACKS.includes(stack)) {
    console.error(`[logger] bad stack value: ${stack}`);
    return;
  }
  if (!VALID_LEVELS.includes(level)) {
    console.error(`[logger] bad level value: ${level}`);
    return;
  }
  if (!VALID_PACKAGES.includes(pkg)) {
    console.error(`[logger] bad package value: ${pkg}`);
    return;
  }

  try {
    const token = await getToken();

    const res = await fetch(`${BASE_URL}/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        stack,
        level,
        package: pkg,
        message,
      }),
    });

    if (!res.ok) {
      console.error(`[logger] log request failed: ${res.status}`);
    }
  } catch (err) {
    // dont crash the app if logging fails
    console.error(`[logger] ${err.message}`);
  }
}
