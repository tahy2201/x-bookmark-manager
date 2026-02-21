import { useState } from "react";
import { Button, Typography, Alert } from "antd";
import type { GoogleUser } from "../types";
import { initSpreadsheet, saveSpreadsheetId } from "../lib/googleSheets";
import { MOCK_SPREADSHEET_ID } from "../lib/mock/data";

const IS_MOCK = import.meta.env.VITE_USE_MOCK === "true";

interface Props {
  onLogin: (user: GoogleUser, spreadsheetId: string) => void;
}

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
].join(" ");

export function LoginScreen({ onLogin }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    setError(null);
    setLoading(true);

    if (IS_MOCK) {
      onLogin(
        { access_token: "mock-token", email: "dev@example.com", name: "Dev User (Mock)" },
        MOCK_SPREADSHEET_ID
      );
      return;
    }

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
          const userRes = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
          );
          const userInfo = (await userRes.json()) as { email: string; name: string };
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ textAlign: "center", maxWidth: 400, width: "100%", padding: "48px 40px" }}>
        <Typography.Title level={2} style={{ marginBottom: 12 }}>
          X Bookmark Manager
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 32 }}>
          XのブックマークをGoogle スプレッドシートで管理します
        </Typography.Paragraph>
        {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
        <Button
          type="primary"
          shape="round"
          size="large"
          block
          loading={loading}
          onClick={handleLogin}
        >
          Googleでログイン
        </Button>
      </div>
    </div>
  );
}
