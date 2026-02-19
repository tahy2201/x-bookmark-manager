import { useEffect, useState } from "react";
import type { GoogleUser } from "../types";
import { initSpreadsheet, saveSpreadsheetId } from "../lib/googleSheets";

interface Props {
  onLogin: (user: GoogleUser, spreadsheetId: string) => void;
}

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
].join(" ");

export function LoginScreen({ onLogin }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // google.accounts が読み込まれるまで待つ
  }, []);

  const handleLogin = () => {
    setError(null);
    setLoading(true);

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError("VITE_GOOGLE_CLIENT_ID is not configured");
      setLoading(false);
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          setError(tokenResponse.error);
          setLoading(false);
          return;
        }
        try {
          // ユーザー情報取得
          const userRes = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
          );
          const userInfo = (await userRes.json()) as { email: string; name: string };

          // スプレッドシート初期化
          const spreadsheetId = await initSpreadsheet(tokenResponse.access_token);
          saveSpreadsheetId(spreadsheetId);

          onLogin(
            {
              access_token: tokenResponse.access_token,
              email: userInfo.email,
              name: userInfo.name,
            },
            spreadsheetId
          );
        } catch (e) {
          setError(e instanceof Error ? e.message : "Login failed");
          setLoading(false);
        }
      },
    });

    tokenClient.requestAccessToken();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>X Bookmark Manager</h1>
        <p style={styles.description}>
          XのブックマークをGoogle スプレッドシートで管理します
        </p>
        {error && <p style={styles.error}>{error}</p>}
        <button
          style={styles.button}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "ログイン中..." : "Googleでログイン"}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "48px 40px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: "12px",
  },
  description: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "32px",
  },
  button: {
    backgroundColor: "#1d9bf0",
    color: "#fff",
    border: "none",
    borderRadius: "24px",
    padding: "12px 32px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  },
  error: {
    color: "#e0245e",
    fontSize: "14px",
    marginBottom: "16px",
  },
};
