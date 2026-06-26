import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { initLogger, Log } from "logging-middleware";

initLogger({
  email: "neha.kumari2023@glbajajgroup.org",
  name: "Neha Kumari",
  rollNo: "2305110100112",
  accessCode: "xxkJnk",
  clientID: "86e346f6-e68b-4f94-bed3-cdefb4b6a8f7",
  clientSecret: "xKYFtjTgWehgdFXy",
});

Log("frontend", "info", "config", "app starting up");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
