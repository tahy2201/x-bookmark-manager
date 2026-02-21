import { useState, useEffect } from "react";
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

  return (
    <ConfigProvider
      theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}
    >
      {user && spreadsheetId ? (
        <MainScreen
          user={user}
          spreadsheetId={spreadsheetId}
          onLogout={handleLogout}
        />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </ConfigProvider>
  );
}

export default App;
