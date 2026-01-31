import { useEffect, useState, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"
import api from "../utils/api"
import { logout } from "../utils/auth"
import { useNavigate } from "react-router-dom"

const playSuccessSound = () => {
  const audio = new Audio(
    "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"
  )
  audio.play().catch(() => {})
}

function Scan() {
  const [result, setResult] = useState(null)
  const [statusMsg, setStatusMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const scannerRef = useRef(null)
  const scanLockRef = useRef(false)

  const startScanner = async () => {
    if (scannerRef.current || result) return

    try {
      scannerRef.current = new Html5Qrcode("qr-reader")
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.7
            return { width: size, height: size }
          }
        },
        async (decodedText) => {
          if (scanLockRef.current) return
          scanLockRef.current = true

          await stopScanner()
          setLoading(true)
          setStatusMsg("Fetching participant details…")

          try {
            const res = await api.post("/scan", { uid: decodedText })
            setResult(res.data)
            playSuccessSound()
            setStatusMsg("")
          } catch (err) {
            console.error("Scan failed:", err)
            setStatusMsg(err?.response?.data?.message || "Invalid QR code")
            scanLockRef.current = false
            await restartScanner()
          } finally {
            setLoading(false)
          }
        }
      )
    } catch (err) {
      console.error("Camera start error:", err)
      setStatusMsg("Camera access failed")
    }
  }

  const stopScanner = async () => {
    if (!scannerRef.current) return
    try {
      await scannerRef.current.stop()
      await scannerRef.current.clear()
    } catch (err) {
      console.warn("Scanner stop error:", err)
    } finally {
      scannerRef.current = null
    }
  }

  const restartScanner = async () => {
    setResult(null)
    setStatusMsg("")
    scanLockRef.current = false
    await stopScanner()
    setTimeout(() => startScanner(), 400)
  }

  const handleCheckin = async () => {
    try {
      await api.post("/checkin", {
        uid: result.participant.uid
      })
      playSuccessSound()
      alert("✅ Check-in successful")
      await restartScanner()
    } catch (err) {
      console.error("Check-in failed:", err)
      alert("❌ Check-in failed")
    }
  }

  const handleLogout = async () => {
    await stopScanner()
    logout()
    navigate("/login")
  }

  useEffect(() => {
    startScanner()
    return () => stopScanner()
  }, [])

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>AI for Education</h1>
          <p style={styles.subtitle}>Policy • Practice • Future Pathways</p>
          <p style={styles.org}>AIC – Siksha 'O' Anusandhan (SOA)</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </header>

      <section style={styles.scannerSection}>
        <div style={styles.scannerHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Volunteer Check-in Scanner</h2>
            <p style={styles.instruction}>Point camera at participant's QR code</p>
          </div>
          {loading && <p style={styles.loadingIndicator}>Processing…</p>}
        </div>

        <div style={styles.qrContainer}>
          <div id="qr-reader" style={styles.qrBox} />
        </div>

        {statusMsg && <p style={styles.errorMessage}>{statusMsg}</p>}
      </section>

      {result && result.valid && (
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Participant Details</h3>
            {result.already_checked_in && (
              <span style={styles.badgeAlreadyCheckedIn}>Already Checked In</span>
            )}
          </div>

          <div style={styles.detailsGrid}>
            <div style={styles.detailGroup}>
              <span style={styles.detailLabel}>Name</span>
              <p style={styles.detailValue}>{result.participant.name}</p>
            </div>

            <div style={styles.detailGroup}>
              <span style={styles.detailLabel}>Email</span>
              <p style={styles.detailValue}>{result.participant.email}</p>
            </div>

            <div style={styles.detailGroup}>
              <span style={styles.detailLabel}>College</span>
              <p style={styles.detailValue}>{result.participant.college}</p>
            </div>

            <div style={styles.detailGroup}>
              <span style={styles.detailLabel}>Role</span>
              <p style={styles.detailValue}>
                <span style={styles.roleBadge}>{result.participant.role}</span>
              </p>
            </div>
          </div>

          <div style={styles.actionButtons}>
            {result.already_checked_in ? (
              <button onClick={restartScanner} style={styles.primaryBtn}>
                Scan Next Participant
              </button>
            ) : (
              <button onClick={handleCheckin} style={styles.successBtn}>
                Approve & Check-in
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export default Scan

const styles = {
  page: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    background: "#0f1419",
    minHeight: "100vh",
    padding: "20px",
    color: "#e4e8eb"
  },
  header: {
    background: "linear-gradient(135deg, #0b1f3a 0%, #0d2847 100%)",
    color: "#fff",
    padding: "24px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
  },
  title: {
    margin: 0,
    fontSize: "26px",
    fontWeight: 700
  },
  subtitle: {
    margin: "6px 0 2px 0",
    fontSize: "13px",
    opacity: 0.9
  },
  org: {
    fontSize: "12px",
    opacity: 0.8
  },
  logoutBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    transition: "all 0.2s"
  },
  scannerSection: {
    marginBottom: "24px",
    background: "#1a1f26",
    padding: "24px",
    borderRadius: "10px",
    border: "1px solid #2d3139",
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
  },
  scannerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px"
  },
  sectionTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: "#e4e8eb"
  },
  instruction: {
    fontSize: "13px",
    color: "#8b92a0",
    margin: "6px 0 0 0"
  },
  loadingIndicator: {
    margin: 0,
    fontSize: "13px",
    color: "#4fa3ff",
    fontWeight: 600
  },
  qrContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "16px"
  },
  qrBox: {
    width: "100%",
    maxWidth: "360px",
    height: "360px",
    borderRadius: "12px",
    overflow: "hidden",
    border: "2px solid #2d3139"
  },
  errorMessage: {
    margin: "12px 0 0 0",
    padding: "12px 14px",
    background: "#3a1f1f",
    border: "1px solid #663333",
    borderRadius: "8px",
    color: "#ff6b6b",
    fontSize: "13px",
    textAlign: "center"
  },
  card: {
    background: "#1a1f26",
    padding: "24px",
    borderRadius: "10px",
    border: "1px solid #2d3139",
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: "1px solid #2d3139"
  },
  cardTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    color: "#e4e8eb"
  },
  badgeAlreadyCheckedIn: {
    display: "inline-block",
    padding: "6px 12px",
    background: "#1a3a2a",
    color: "#4ade80",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "20px"
  },
  detailGroup: {
    background: "#0f1419",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #2d3139"
  },
  detailLabel: {
    display: "block",
    fontSize: "11px",
    color: "#8b92a0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "6px"
  },
  detailValue: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 600,
    color: "#e4e8eb"
  },
  roleBadge: {
    display: "inline-block",
    padding: "4px 10px",
    background: "#1e3a5f",
    color: "#4fa3ff",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "capitalize"
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
    paddingTop: "16px",
    borderTop: "1px solid #2d3139"
  },
  primaryBtn: {
    flex: 1,
    padding: "12px 16px",
    background: "#0077cc",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s"
  },
  successBtn: {
    flex: 1,
    padding: "12px 16px",
    background: "linear-gradient(135deg, #0077cc 0%, #0066aa 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(0,119,204,0.3)"
  }
}
