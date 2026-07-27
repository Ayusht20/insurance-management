import { createContext, useContext, useState } from "react";
import { loginUser } from "../services/authService";
import { jwtDecode } from "jwt-decode";
// import jwtDecode from "jwt-decode";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return { id: decoded.sub, role: decoded.role };
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    localStorage.setItem("access_token", res.data.access_token);
    const decoded = jwtDecode(res.data.access_token);
    setUser({ id: decoded.sub, role: decoded.role });
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);