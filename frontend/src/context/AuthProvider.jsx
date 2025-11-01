import React, { useState } from "react"
import { AuthContext } from "./AuthContext"

// Context Provider
export const AuthProvider = ({ children }) => {
  // Try to load user and token from localStorage on initial load
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user")
    return storedUser ? JSON.parse(storedUser) : null
  })

  const [token, setToken] = useState(localStorage.getItem("token"))

  const isLoggedIn = !!user
  const isAdmin = user?.role === "admin"

  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("token", jwtToken)
  }

  // handle logout
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("user")
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
