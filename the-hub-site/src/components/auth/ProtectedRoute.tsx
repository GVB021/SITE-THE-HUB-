import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role } from '../../types'
import { useAuthStore } from '../../store/auth'

type ProtectedRouteProps = {
  allowedRoles: Role[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
