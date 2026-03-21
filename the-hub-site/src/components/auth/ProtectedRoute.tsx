import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role } from '../../types'
import { useAuth } from '../../contexts/AuthContext'

type ProtectedRouteProps = {
  allowedRoles: Role[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const { user, loading, destinationForRole } = useAuth()

  if (loading) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!allowedRoles.includes(user.hub_role)) {
    return <Navigate to={destinationForRole(user.hub_role)} replace />
  }

  return <Outlet />
}
