import { Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Admin from "./pages/Admin"
import Scan from "./pages/Scan"
import ProtectedRoute from "./components/ProtectedRoute"
import { getRole } from "./utils/auth"

function App() {
  const role = getRole()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Admin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/scan"
        element={
          <ProtectedRoute allowedRoles={["volunteer", "admin"]}>
            <Scan />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          role === "admin"
            ? <Navigate to="/admin" />
            : role === "volunteer"
            ? <Navigate to="/scan" />
            : <Navigate to="/login" />
        }
      />
    </Routes>
  )
}

export default App
