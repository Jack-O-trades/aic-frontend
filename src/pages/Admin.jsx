import { useNavigate } from "react-router-dom"
import { logout } from "../utils/auth"

function Admin() {
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div style={{ padding: "40px" }}>
      <h2>Admin Dashboard</h2>
      <p>Only admins can see this.</p>

      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Admin
