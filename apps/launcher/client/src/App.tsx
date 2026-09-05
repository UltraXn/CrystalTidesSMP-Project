import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./services/authContext";
import { checkForAppUpdates, UpdateInfo } from "./services/updateService";
import {
  CrystalClientView,
  LauncherLoginView,
  LauncherLoadingScreen,
  UpdaterModal,
} from "./components";
import "./App.css";

function LauncherContent() {
  const { currentSession, isLoading, loginMicrosoft, loginGuest } = useAuth();
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    checkForAppUpdates().then((info) => {
      if (info.available) {
        setUpdateInfo(info);
      }
    });
  }, []);

  if (isLoading) {
    return <LauncherLoadingScreen />;
  }

  if (!currentSession) {
    return (
      <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }}>
        <LauncherLoginView
          onLoginMicrosoft={async () => {
            try {
              await loginMicrosoft();
            } catch (err) {
              console.error("Error al iniciar sesión con Microsoft:", err);
            }
          }}
          onContinueAsGuest={(username) => {
            loginGuest(username || "Jugador");
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }}>
      <CrystalClientView />

      {updateInfo?.available && updateInfo.updateObj && (
        <UpdaterModal
          version={updateInfo.version || "Nueva versión"}
          notes={updateInfo.notes}
          updateObj={updateInfo.updateObj}
          onClose={() => setUpdateInfo(null)}
        />
      )}
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
