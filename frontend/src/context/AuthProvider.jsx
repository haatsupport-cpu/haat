import React, { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { authService } from "../services/auth-service";
import { getAuthToken, setAuthToken } from "../services/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Bootstrap user on app load
   * Only runs once thanks to useEffect cleanup + mounted flag
   */
  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      const token = getAuthToken();
      if (!token) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await authService.getCurrentUser();
        if (!mounted) return;

        if (response?.data?.success && response?.data?.user) {
          setUser(response.data.user);
          setError(null);
        } else {
          setUser(null);
          setAuthToken(null);
        }
      } catch (err) {
        if (!mounted) return;

        const status = err?.response?.status;

        // 401: Token invalid or expired - clear it
        if (status === 401) {
          setUser(null);
          setAuthToken(null);
        }
        // Network errors are logged once during bootstrap. Avoid retry loops while the API is offline.
        else if (!err?.response) {
          console.debug("[AuthProvider] Auth API unavailable:", err?.message);
        }
        // Other error: log but don't show to user yet
        else {
          console.debug("[AuthProvider] Auth check failed:", status, err?.message);
        }

        setError(null); // Don't show error to user on bootstrap
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    // Cleanup
    return () => {
      mounted = false;
    };
  }, []); // Only run once on mount

  /**
   * Logout: clear user and token
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Logout failure is non-critical, still clear local state
      console.debug("[AuthProvider] Logout error (ignored):", err?.message);
    } finally {
      setUser(null);
      setAuthToken(null);
      setError(null);
    }
  };

  /**
   * Manual login: called after successful login request
   */
  const loginUser = (user, token) => {
    setUser(user);
    setAuthToken(token);
    setError(null);
  };

  const value = {
    user,
    isLoggedIn: !!user,
    isAdmin: user?.role === "admin",
    isVendor: user?.role === "vendor",
    loading,
    error,
    logout,
    setUser,
    loginUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

