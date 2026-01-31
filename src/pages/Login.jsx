import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"


const API_BASE = "https://aic-checkin-system.onrender.com"

function Login() {
const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await axios.post(`${API_BASE}/login`, {
        username,
        password
      })

      // store token + role
      localStorage.setItem("token", res.data.access_token)
      localStorage.setItem("role", res.data.role)

if (res.data.role === "admin") {
  navigate("/admin")
} else {
  navigate("/scan")
}
    }  catch (err) {
  console.log(err.response?.data)
  setError(err.response?.data?.detail || "Login failed")
} finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h2>AIC 2026 Check-in Login</h2>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  )
}

export default Login
