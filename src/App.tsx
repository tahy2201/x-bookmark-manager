import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import type { GoogleUser } from "./types";
import { LoginScreen } from "./components/LoginScreen";
import { MainScreen } from "./components/MainScreen";
import { getSpreadsheetId } from "./lib/googleSheets";

function App() {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(
    getSpreadsheetId()
  );
  const [isDark, setIsDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleLogin = (loggedInUser: GoogleUser, ssId: string) => {
    setUser(loggedInUser);
    setSpreadsheetId(ssId);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const isAuthenticated = !!(user && spreadsheetId);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ConfigProvider
        theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}
      >
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated
                ? <Navigate to="/" replace />
                : <LoginScreen onLogin={handleLogin} />
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated
                ? <MainScreen user={user!} spreadsheetId={spreadsheetId!} onLogout={handleLogout} />
                : <Navigate to="/login" replace />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
