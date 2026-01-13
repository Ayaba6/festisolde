import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

interface VendorRouteProps {
  user: any
  children: ReactNode
}

export default function VendorRoute({ user, children }: VendorRouteProps) {
  return (
    <ProtectedRoute user={user}>
      {user?.role === 'vendor'
        ? children
        : <Navigate to="/account" replace />
      }
    </ProtectedRoute>
  )
}
