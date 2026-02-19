import { useState } from "react";
import type { GoogleUser } from "./types";
import { LoginScreen } from "./components/LoginScreen";
import { MainScreen } from "./components/MainScreen";
import { getSpreadsheetId } from "./lib/googleSheets";

function App() {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(
    getSpreadsheetId()
  );

  const handleLogin = (loggedInUser: GoogleUser, ssId: string) => {
    setUser(loggedInUser);
    setSpreadsheetId(ssId);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (user && spreadsheetId) {
    return (
      <MainScreen
        user={user}
        spreadsheetId={spreadsheetId}
        onLogout={handleLogout}
      />
    );
  }

  return <LoginScreen onLogin={handleLogin} />;
}

export default App;
