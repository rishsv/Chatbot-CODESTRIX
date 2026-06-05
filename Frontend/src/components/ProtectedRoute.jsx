import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const ProtectedRoute = ({ children }) => {
  const authenticated = useAuthStore((s) => s.authenticated)
  const location = useLocation()

  if (!authenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{ authRequired: true }}
      />
    )
  }

  return children
}

export default ProtectedRoute