import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  userId: string | null;
  login: (token: string) => void;
  logout: () => void;
}

// --- Helper to decode a JWT ---
function decodeJwt(token: string | null): any {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(sessionStorage.getItem("jwt"));
  const [userId, setUserId] = useState<string | null>(null);

  const isLoggedIn = !!token;

  // Decode token whenever it changes
  useEffect(() => {
    if (token) {
      try {
        const payload = decodeJwt(token);
        setUserId(payload?.sub || null); // or whatever field has the userId
      } catch (e) {
        console.warn("Failed to decode JWT", e);
        setUserId(null);
      }
    } else {
      setUserId(null);
    }
  }, [token]);

  // Listen for token updates in sessionStorage (from login/logout)
  useEffect(() => {
    const handler = () => setToken(sessionStorage.getItem("jwt"));
    window.addEventListener("jwt_updated", handler);
    return () => window.removeEventListener("jwt_updated", handler);
  }, []);

  const login = (newToken: string) => {
    sessionStorage.setItem("jwt", newToken);
    window.dispatchEvent(new Event("jwt_updated")); // triggers listener
  };

  const logout = () => {
    sessionStorage.removeItem("jwt");
    window.dispatchEvent(new Event("jwt_updated"));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
