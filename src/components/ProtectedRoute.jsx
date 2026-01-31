import { Navigate } from "react-router-dom"
import { isLoggedIn, getRole } from "../utils/auth"

function ProtectedRoute({ children, allowedRoles }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" />
  }

  const role = getRole()

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" />
  }

  return children
}

export default ProtectedRoute
