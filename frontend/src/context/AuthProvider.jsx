import React, { useState } from "react"
import { AuthContext } from "./AuthContext"
import { authService } from "../utils/auth"

// Context Provider
export const AuthProvider = ({ children }) => {
  // Try to load user and token from localStorage on initial load
  const [user, setUser] = useState(() => {
    return authService.getUser()
  })

  const [token, setToken] = useState(authService.getToken())

  const isLoggedIn = !!user
  const isAdmin = user?.role === "admin"

  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    authService.setAuth(jwtToken, userData)
  }

  // handle logout
  const logout = () => {
    setUser(null)
    setToken(null)
    authService.clearAuth()
    // Remove legacy key used in old auth flow.
    localStorage.removeItem("token")
  }

  const value = {
    user,
    token,
    isLoggedIn,
    isAdmin,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
