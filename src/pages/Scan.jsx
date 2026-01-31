import { useEffect, useState, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"
import api from "../utils/api"
import { logout } from "../utils/auth"
import { useNavigate } from "react-router-dom"

/* ================== SOUND ================== */
const playSuccessSound = () => {
  const audio = new Audio(
    "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"
  )
  audio.play().catch(() => {})
}

/* ================== COMPONENT ================== */
function Scan() {
  const [result, setResult] = useState(null)
  const [statusMsg, setStatusMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const scannerRef = useRef(null)
  const scanLockRef = useRef(false) // 🔒 prevents multiple scans

  /* ================== START SCANNER ================== */
  const startScanner = async () => {
    if (scannerRef.current || result) return

    try {
      scannerRef.current = new Html5Qrcode("qr-reader")

      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: (viewfinderWidth, viewfinderHeight) => {
  const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.7
  return { width: size, height: size }
} },
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
            setStatusMsg(
              err?.response?.data?.message || "Invalid QR code"
            )
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

  /* ================== STOP SCANNER ================== */
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

  /* ================== RESTART SCANNER ================== */
  const restartScanner = async () => {
    setResult(null)
    setStatusMsg("")
    scanLockRef.current = false
    await stopScanner()
    setTimeout(() => startScanner(), 400)
  }

  /* ================== CHECK-IN ================== */
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

  /* ================== LOGOUT ================== */
  const handleLogout = async () => {
    await stopScanner()
    logout()
    navigate("/login")
  }

  /* ================== LIFECYCLE ================== */
  useEffect(() => {
    startScanner()
    return () => stopScanner()
  }, [])

  /* ================== UI ================== */
  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>AI for Education</h1>
          <p style={styles.subtitle}>
            Policy • Practice • Future Pathways
          </p>
          <p style={styles.org}>
            AIC – Siksha ‘O’ Anusandhan (SOA)
          </p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </header>

      {/* Scanner */}
      <section style={styles.scannerSection}>
        <h2 style={styles.sectionTitle}>
          Volunteer Check-in Scanner
        </h2>
        <p style={styles.instruction}>
          Scan participant QR code
        </p>

        <div id="qr-reader" style={styles.qrBox} />

        {loading && <p style={styles.info}>Processing…</p>}
        {statusMsg && <p style={styles.error}>{statusMsg}</p>}
      </section>

      {/* Result */}
      {result && result.valid && (
        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Participant Details</h3>

          <div style={styles.detailRow}>
            <span>Name</span>
            <strong>{result.participant.name}</strong>
          </div>

          <div style={styles.detailRow}>
            <span>Email</span>
            <strong>{result.participant.email}</strong>
          </div>

          <div style={styles.detailRow}>
            <span>College</span>
            <strong>{result.participant.college}</strong>
          </div>

          <div style={styles.detailRow}>
            <span>Role</span>
            <strong>{result.participant.role}</strong>
          </div>

          {result.already_checked_in ? (
  <>
    <div style={styles.badgeWarning}>
      Already Checked In
    </div>

    <button
      onClick={restartScanner}
      style={styles.approveBtn}
    >
      Scan Next Participant
    </button>
  </>
) : (
  <button
    onClick={handleCheckin}
    style={styles.approveBtn}
  >
    Approve & Check-in
  </button>
)}
        </section>
      )}
    </div>
  )
}

export default Scan

/* ================== STYLES ================== */

const styles = {
  page: {
    fontFamily: "system-ui, sans-serif",
    background: "#f5f7fb",
    minHeight: "100vh",
    padding: "16px"
  },
  header: {
    background: "#0b1f3a",
    color: "#fff",
    padding: "16px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700
  },
  subtitle: {
    margin: "4px 0",
    fontSize: "13px",
    opacity: 0.9
  },
  org: {
    fontSize: "12px",
    opacity: 0.8
  },
  logoutBtn: {
    background: "#ffffff22",
    border: "1px solid #ffffff55",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer"
  },
  scannerSection: {
    marginTop: "20px",
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center"
  },
  sectionTitle: {
    margin: 0,
    fontSize: "18px"
  },
  instruction: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "12px"
  },
  qrBox: {
    width: "320px",
    height: "320px",
    margin: "0 auto"
  },
  info: {
    marginTop: "10px",
    color: "#0077cc"
  },
  error: {
    marginTop: "10px",
    color: "#c0392b"
  },
  card: {
    marginTop: "20px",
    background: "#fff",
    padding: "20px",
    borderRadius: "12px"
  },
  cardTitle: {
    marginBottom: "12px",
    fontSize: "16px"
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    borderBottom: "1px solid #eee",
    fontSize: "14px"
  },
  badgeWarning: {
    marginTop: "16px",
    padding: "10px",
    borderRadius: "8px",
    background: "#fff3cd",
    color: "#856404",
    textAlign: "center",
    fontWeight: 600
  },
  approveBtn: {
    marginTop: "16px",
    width: "100%",
    padding: "14px",
    background: "#0b5ed7",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer"
  }
}
