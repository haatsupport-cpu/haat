import React, { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import axiosClient from "../utils/axiosClient";

const AUTH_TOKEN_STORAGE_KEY = "haatonline_auth_token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveToken = (accessToken) => {
    if (typeof window !== "undefined") {
      if (accessToken) {
        window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, accessToken);
      } else {
        window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const response = await axiosClient.get("/auth/me");
        if (!mounted) return;

        if (response?.data?.user) {
          setUser(response.data.user);
        }
      } catch {
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const logout = async () => {
    await axiosClient.post("/auth/logout");
    setUser(null);
    saveToken(null);
  };

  const value = {
    user,
    isLoggedIn: !!user,
    isAdmin: user?.role === "admin",
    loading,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
