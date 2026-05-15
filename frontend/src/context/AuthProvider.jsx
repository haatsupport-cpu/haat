import React, { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { supabase } from "../supabaseClient";

const AUTH_TOKEN_STORAGE_KEY = "haatonline_auth_token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("customer");
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveToken = (accessToken) => {
    setToken(accessToken ?? null);
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
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        setUser(session?.user ?? null);
        saveToken(session?.access_token ?? null);

        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle();
          setRole(profile?.role ?? "customer");
        } else {
          setRole("customer");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        saveToken(session?.access_token ?? null);

        try {
          if (session?.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", session.user.id)
              .maybeSingle();
            setRole(profile?.role ?? "customer");
          } else {
            setRole("customer");
          }
        } catch {
          setRole("customer");
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole("customer");
    saveToken(null);
  };

  const value = {
    user,
    token,
    isLoggedIn: !!user,
    isAdmin: role === "admin",
    loading,
    logout,
    login: async () => {
      // no-op: deprecated in Supabase flow
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
