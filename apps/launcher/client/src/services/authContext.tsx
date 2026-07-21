import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { requestDeviceCode, pollMicrosoftToken, refreshMicrosoftSession, type MicrosoftDeviceCode, loginMicrosoftRedirect } from "./microsoftAuthService";

export type AuthType = "guest" | "microsoft" | "none";

export interface UserSession {
  id: string;
  username: string;
  type: AuthType;
  skinUrl?: string;
  uuid?: string;
  accessToken?: string;
  refreshToken?: string;
  role?: string;
}

export interface CrystalWebSession {
  username: string;
  email: string;
  avatarUrl?: string;
  role: string;
}

export interface SavedAccount {
  id: string;
  username: string;
  type: AuthType;
  uuid?: string;
  skinUrl?: string;
  lastUsed: string; // ISO String
}

interface AuthContextType {
  currentSession: UserSession | null;
  crystalSession: CrystalWebSession | null;
  savedAccounts: SavedAccount[];
  isLoading: boolean;
  msDeviceCode: MicrosoftDeviceCode | null;
  loginGuest: (username: string) => Promise<void>;
  loginCrystal: (email: string, password: string) => Promise<void>;
  logoutCrystal: () => Promise<void>;
  loginMicrosoft: () => Promise<void>;
  selectAccount: (accountId: string) => Promise<void>;
  removeAccount: (accountId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [crystalSession, setCrystalSession] = useState<CrystalWebSession | null>(null);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [msDeviceCode, setMsDeviceCode] = useState<MicrosoftDeviceCode | null>(null);

  // Load accounts and session on mount
  useEffect(() => {
    const loadSessionAndAccounts = async () => {
      try {
        // 1. Restore Supabase (CrystalTides web account) session if exists
        try {
          const cachedCrystalJson = localStorage.getItem("crystaltides_crystal_session");
          if (cachedCrystalJson) {
            try {
              setCrystalSession(JSON.parse(cachedCrystalJson));
            } catch {}
          }

          const { data: { session: sbSession } } = await supabase.auth.getSession();
          if (sbSession && sbSession.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("username, role, avatar_url, social_avatar_url")
              .eq("id", sbSession.user.id)
              .maybeSingle();

            const username = profile?.username || sbSession.user.user_metadata?.username || sbSession.user.email?.split("@")[0] || "Crystal User";
            const role = profile?.role || sbSession.user.user_metadata?.role || "user";
            const avatarUrl = profile?.avatar_url || profile?.social_avatar_url || sbSession.user.user_metadata?.avatar_url || sbSession.user.user_metadata?.picture;
            
            const sessionData: CrystalWebSession = {
              username,
              email: sbSession.user.email || "",
              avatarUrl,
              role,
            };
            setCrystalSession(sessionData);
            localStorage.setItem("crystaltides_crystal_session", JSON.stringify(sessionData));
          } else if (!sbSession) {
            localStorage.removeItem("crystaltides_crystal_session");
            setCrystalSession(null);
          }
        } catch (sbErr) {
          console.error("Error loading Supabase session:", sbErr);
        }

        // 2. Restore Minecraft saved accounts (only Guest & Microsoft)
        const storedAccountsJson = localStorage.getItem("crystaltides_saved_accounts");
        const storedAccounts: SavedAccount[] = storedAccountsJson 
          ? JSON.parse(storedAccountsJson).filter((a: any) => a.type !== "crystal") 
          : [];
        setSavedAccounts(storedAccounts);

        const lastActiveId = localStorage.getItem("crystaltides_active_account_id");
        if (lastActiveId && !lastActiveId.startsWith("crystal_")) {
          const account = storedAccounts.find((a) => a.id === lastActiveId);
          if (account) {
            // Restore active session
            const credentialsJson = localStorage.getItem(`crystaltides_credentials_${account.id}`);
            const credentials = credentialsJson ? JSON.parse(credentialsJson) : {};
            
            if (account.type === "microsoft" && credentials.refreshToken) {
              // Try to refresh Microsoft token silently
              try {
                const result = await refreshMicrosoftSession(credentials.refreshToken);
                const session: UserSession = {
                  id: account.id,
                  username: result.username,
                  type: "microsoft",
                  uuid: result.uuid,
                  accessToken: result.accessToken,
                  refreshToken: result.refreshToken,
                };
                localStorage.setItem(`crystaltides_credentials_${account.id}`, JSON.stringify({
                  accessToken: result.accessToken,
                  refreshToken: result.refreshToken,
                }));
                setCurrentSession(session);
              } catch {
                // Refresh failed, user will need to re-auth
                localStorage.removeItem("crystaltides_active_account_id");
              }
            } else {
              // For guest, restore session directly
              const session: UserSession = {
                id: account.id,
                username: account.username,
                type: account.type,
                skinUrl: account.skinUrl,
                uuid: account.uuid,
                accessToken: credentials.accessToken,
                refreshToken: credentials.refreshToken,
              };
              setCurrentSession(session);
            }
          }
        }
      } catch (err) {
        console.error("Error loading session:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionAndAccounts();
  }, []);

  const saveAccountsList = (list: SavedAccount[]) => {
    setSavedAccounts(list);
    localStorage.setItem("crystaltides_saved_accounts", JSON.stringify(list));
  };

  const loginGuest = async (username: string) => {
    setIsLoading(true);
    try {
      const accountId = `guest_${username.toLowerCase()}`;
      
      const newAccount: SavedAccount = {
        id: accountId,
        username,
        type: "guest",
        uuid: `00000000-0000-0000-0000-000000000000`, 
        lastUsed: new Date().toISOString(),
      };

      // Add to saved accounts list
      const updatedList = savedAccounts.filter((a) => a.id !== accountId);
      updatedList.unshift(newAccount);
      saveAccountsList(updatedList);

      // Set active session
      localStorage.setItem("crystaltides_active_account_id", accountId);
      
      const session: UserSession = {
        id: accountId,
        username,
        type: "guest",
        uuid: newAccount.uuid,
      };
      setCurrentSession(session);
    } finally {
      setIsLoading(false);
    }
  };

  // Login for CrystalTides web account (Supabase connection)
  const loginCrystal = async (emailInput: string, passwordInput: string) => {
    const email = emailInput.trim();
    const password = passwordInput.trim();

    if (!email.includes("@")) {
      throw new Error("Por favor ingresa tu correo electrónico registrado en la web (ej: tu_correo@gmail.com).");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Correo o contraseña incorrectos. Por favor verifica tus datos de crystaltidessmp.net.");
      }
      if (error.message.includes("Email not confirmed")) {
        throw new Error("Debes confirmar tu correo electrónico registrado antes de iniciar sesión.");
      }
      throw new Error(error.message || "Error al conectar con la cuenta de CrystalTides.");
    }

    if (!data.user) throw new Error("No se pudo iniciar sesión en CrystalTides.");

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, role, avatar_url, social_avatar_url")
      .eq("id", data.user.id)
      .maybeSingle();

    const username = profile?.username || data.user.user_metadata?.username || email.split("@")[0];
    const role = profile?.role || data.user.user_metadata?.role || "user";
    const avatarUrl = profile?.avatar_url || profile?.social_avatar_url || data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture;

    const sessionData: CrystalWebSession = {
      username,
      email,
      avatarUrl,
      role,
    };

    setCrystalSession(sessionData);
    localStorage.setItem("crystaltides_crystal_session", JSON.stringify(sessionData));
  };

  const logoutCrystal = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("crystaltides_crystal_session");
      setCrystalSession(null);
    } catch (err) {
      console.error("Error signing out of CrystalTides web:", err);
    }
  };

  const loginMicrosoft = async () => {
    setIsLoading(true);
    setMsDeviceCode(null);
    try {
      let result;
      try {
        result = await loginMicrosoftRedirect();
      } catch (redirectErr) {
        console.warn("Local redirect login failed, falling back to device code:", redirectErr);
        // 1. Request device code
        const dc = await requestDeviceCode();
        setMsDeviceCode(dc);
        setIsLoading(false); // Let user see the code while we poll

        // 2. Poll for token
        result = await pollMicrosoftToken(dc.device_code, dc.interval, dc.expires_in);
        setMsDeviceCode(null);
        setIsLoading(true);
      }

      const accountId = `microsoft_${result.uuid}`;

      const newAccount: SavedAccount = {
        id: accountId,
        username: result.username,
        type: "microsoft",
        uuid: result.uuid,
        lastUsed: new Date().toISOString(),
      };

      localStorage.setItem(`crystaltides_credentials_${accountId}`, JSON.stringify({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }));

      const updatedList = savedAccounts.filter((a) => a.id !== accountId);
      updatedList.unshift(newAccount);
      saveAccountsList(updatedList);

      localStorage.setItem("crystaltides_active_account_id", accountId);

      const session: UserSession = {
        id: accountId,
        username: result.username,
        type: "microsoft",
        uuid: result.uuid,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      };
      setCurrentSession(session);
    } catch (err) {
      setMsDeviceCode(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const selectAccount = async (accountId: string) => {
    setIsLoading(true);
    try {
      const account = savedAccounts.find((a) => a.id === accountId);
      if (!account) return;

      const credentialsJson = localStorage.getItem(`crystaltides_credentials_${account.id}`);
      const credentials = credentialsJson ? JSON.parse(credentialsJson) : {};

      const session: UserSession = {
        id: account.id,
        username: account.username,
        type: account.type,
        skinUrl: account.skinUrl,
        uuid: account.uuid,
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken,
      };
      setCurrentSession(session);

      // Update lastUsed
      const updatedList = savedAccounts.map((a) => {
        if (a.id === accountId) {
          return { ...a, lastUsed: new Date().toISOString() };
        }
        return a;
      });
      // Sort: most recently used first
      updatedList.sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime());
      saveAccountsList(updatedList);

      localStorage.setItem("crystaltides_active_account_id", accountId);
    } catch (err) {
      console.error("Failed to switch account:", err);
      // Remove active account pointer if it failed
      localStorage.removeItem("crystaltides_active_account_id");
      setCurrentSession(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeAccount = async (accountId: string) => {
    // If we're removing the active account, log out
    if (currentSession?.id === accountId) {
      await logout();
    }

    // Clean credentials
    localStorage.removeItem(`crystaltides_credentials_${accountId}`);

    // Update list
    const updatedList = savedAccounts.filter((a) => a.id !== accountId);
    saveAccountsList(updatedList);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem("crystaltides_active_account_id");
      setCurrentSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentSession,
        crystalSession,
        savedAccounts,
        isLoading,
        msDeviceCode,
        loginGuest,
        loginCrystal,
        logoutCrystal,
        loginMicrosoft,
        selectAccount,
        removeAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
