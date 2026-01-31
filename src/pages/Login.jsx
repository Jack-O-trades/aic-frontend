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

      localStorage.setItem("token", res.data.access_token)
      localStorage.setItem("role", res.data.role)

      if (res.data.role === "admin") {
        navigate("/admin")
      } else {
        navigate("/scan")
      }
    } catch (err) {
      console.log(err.response?.data)
      setError(err.response?.data?.detail || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Branding */}
        <div style={styles.brandSection}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>AIC</div>
          </div>
          <h1 style={styles.brandTitle}>AI for Education</h1>
          <p style={styles.brandSubtitle}>
            Siksha 'O' Anusandhan (SOA) – Policy • Practice • Future Pathways
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={styles.form}>
          <h2 style={styles.formTitle}>Check-in System</h2>
          <p style={styles.formSubtitle}>Sign in to access the event dashboard</p>

          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={styles.input}
              required
            />
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            AIC 2026 • Participant Check-in System
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

/* ================== STYLES ================== */

const styles = {
  page: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    background: "linear-gradient(135deg, #0f1419 0%, #1a2838 100%)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px"
  },
  container: {
    width: "100%",
    maxWidth: "420px",
    background: "#1a1f26",
    border: "1px solid #2d3139",
    borderRadius: "14px",
    padding: "40px 32px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    backdropFilter: "blur(8px)"
  },
  brandSection: {
    textAlign: "center",
    marginBottom: "32px"
  },
  logo: {
    marginBottom: "16px"
  },
  logoIcon: {
    display: "inline-block",
    width: "56px",
    height: "56px",
    background: "linear-gradient(135deg, #0077cc 0%, #0066aa 100%)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: 700,
    color: "#fff",
    boxShadow: "0 4px 16px rgba(0,119,204,0.3)"
  },
  brandTitle: {
    margin: "12px 0 4px 0",
    fontSize: "24px",
    fontWeight: 700,
    color: "#e4e8eb",
    letterSpacing: "-0.5px"
  },
  brandSubtitle: {
    margin: 0,
    fontSize: "12px",
    color: "#8b92a0",
    lineHeight: 1.4
  },
  form: {
    marginBottom: "24px"
  },
  formTitle: {
    margin: "0 0 6px 0",
    fontSize: "18px",
    fontWeight: 700,
    color: "#e4e8eb"
  },
  formSubtitle: {
    margin: "0 0 20px 0",
    fontSize: "13px",
    color: "#8b92a0"
  },
  formGroup: {
    marginBottom: "16px"
  },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#b4b9c2",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    background: "#0f1419",
    border: "1px solid #2d3139",
    borderRadius: "8px",
    color: "#e4e8eb",
    fontSize: "14px",
    boxSizing: "border-box",
    transition: "all 0.2s",
    outline: "none",
    "&:focus": {
      borderColor: "#0077cc",
      boxShadow: "0 0 0 3px rgba(0,119,204,0.1)"
    }
  },
  submitBtn: {
    width: "100%",
    padding: "12px 16px",
    background: "linear-gradient(135deg, #0077cc 0%, #0066aa 100%)",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(0,119,204,0.3)",
    marginTop: "8px"
  },
  errorBox: {
    padding: "12px 14px",
    background: "#3a1f1f",
    border: "1px solid #663333",
    borderRadius: "8px",
    color: "#ff6b6b",
    fontSize: "13px",
    marginBottom: "16px",
    lineHeight: 1.4
  },
  footer: {
    textAlign: "center",
    paddingTop: "20px",
    borderTop: "1px solid #2d3139"
  },
  footerText: {
    margin: 0,
    fontSize: "12px",
    color: "#8b92a0"
  }
}
