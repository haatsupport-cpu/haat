// Auth utility functions for managing user state
const AUTH_TOKEN_KEY = "authToken"
const USER_KEY = "user"

export const authService = {
  // Save auth token and user info
  setAuth: (token, user) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  },

  // Get current user
  getUser: () => {
    const userStr = localStorage.getItem(USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  },

  // Get user ID
  getUserId: () => {
    const user = authService.getUser()
    return user?.id || null
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!authService.getToken()
  },

  // Clear auth data (logout)
  clearAuth: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  // Get axios config with auth header
  getAuthHeader: () => {
    const token = authService.getToken()
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  },
}

