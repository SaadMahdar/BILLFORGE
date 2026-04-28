import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useState(() => {
    const token = localStorage.getItem("BILLFORGE_token");
    if (token) {
      // TODO: Verify token with backend
      setUser({ name: "User", email: "user@example.com" });
    }
    setLoading(false);
  });

  const login = (userData, token) => {
    localStorage.setItem("BILLFORGE_token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("BILLFORGE_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
