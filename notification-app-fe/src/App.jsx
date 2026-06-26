import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Button, Container, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { NotificationsPage } from "./pages/NotificationsPage";
import { PriorityPage } from "./pages/PriorityPage";
import { Log } from "logging-middleware";
import { useEffect } from "react";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1565c0" },
  },
});

function NavBar() {
  const loc = useLocation();

  useEffect(() => {
    Log("frontend", "info", "page", `navigated to ${loc.pathname}`);
  }, [loc.pathname]);

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar variant="dense">
        <Button
          component={Link} to="/"
          color="inherit"
          sx={{ fontWeight: loc.pathname === "/" ? 700 : 400 }}
        >
          All
        </Button>
        <Button
          component={Link} to="/priority"
          color="inherit"
          sx={{ fontWeight: loc.pathname === "/priority" ? 700 : 400 }}
        >
          Priority
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Container maxWidth="md" sx={{ mt: 2 }}>
          <Routes>
            <Route path="/" element={<NotificationsPage />} />
            <Route path="/priority" element={<PriorityPage />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
}