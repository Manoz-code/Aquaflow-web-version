import { createContext, useContext, useState } from "react";
import {
  loginUser,
  getProfile,
} from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
  const savedUser = localStorage.getItem("user");

  return savedUser ? JSON.parse(savedUser) : null;
});

const [token, setToken] = useState(() => {
  return localStorage.getItem("token");
});
  const login = async (phone, password) => {
    console.log("AuthContext login started");

    const data = await loginUser(phone, password);

    console.log("Data received in AuthContext:", data);

    setUser(data.user);
    setToken(data.token);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateUser = (updatedUser) => {
  setUser(updatedUser);
  localStorage.setItem("user", JSON.stringify(updatedUser));
};
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};