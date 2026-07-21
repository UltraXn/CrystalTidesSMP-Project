import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./services/authContext";
import { LoginPage } from "./components/LoginPage";
import { MainLayout } from "./components/MainLayout";
import { WindowTitleBar } from "./components/WindowTitleBar";
import { InstallerModePage } from "./components/InstallerModePage";
import { UninstallerModePage } from "./components/UninstallerModePage";
import "./App.css";

function LauncherContent() {
  const { currentSession, isLoading } = useAuth();
  const [appMode, setAppMode] = useState<"launcher" | "installer" | "uninstaller">("launcher");

  useEffect(() => {
    // Check URL query params or hash for mode
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    const hash = window.location.hash.replace("#", "");

    if (modeParam === "installer" || hash === "installer") {
      setAppMode("installer");
    } else if (modeParam === "uninstaller" || hash === "uninstaller") {
      setAppMode("uninstaller");
    }
  }, []);

  if (appMode === "installer") {
    return <InstallerModePage onFinish={() => setAppMode("launcher")} />;
  }

  if (appMode === "uninstaller") {
    return <UninstallerModePage />;
  }

  if (isLoading) {
    return (
      <div style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--background)",
        color: "var(--accent)",
        fontSize: 16,
        fontWeight: "bold",
      }}>
        Cargando launcher...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <WindowTitleBar />
      <div style={{ flex: 1, overflow: "hidden", position: "relative", paddingTop: 32 }}>
        {!currentSession ? <LoginPage /> : <MainLayout />}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LauncherContent />
    </AuthProvider>
  );
}

export default App;
