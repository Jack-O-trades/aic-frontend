import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { logout } from "../utils/auth"
import api from "../utils/api"

function Admin() {
  const navigate = useNavigate()
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [sortBy, setSortBy] = useState("checkin_time")

  useEffect(() => {
    fetchParticipants()
  }, [])

  const fetchParticipants = async () => {
    try {
      setLoading(true)
      const res = await api.get("/participants")
      setParticipants(res.data.participants || [])
    } catch (err) {
      console.error("Failed to fetch participants:", err)
      setParticipants([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleExport = () => {
    const csv = [
      ["Name", "Email", "College", "Role", "Check-in Time"],
      ...filteredAndSortedParticipants.map(p => [
        p.name,
        p.email,
        p.college,
        p.role,
        p.checked_in_at || "Not checked in"
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `participants-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const filteredAndSortedParticipants = participants
    .filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.college.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = filterRole === "all" || p.role === filterRole
      return matchesSearch && matchesRole
    })
    .sort((a, b) => {
      if (sortBy === "checkin_time") {
        const aTime = a.checked_in_at ? new Date(a.checked_in_at) : new Date(0)
        const bTime = b.checked_in_at ? new Date(b.checked_in_at) : new Date(0)
        return bTime - aTime
      } else if (sortBy === "name") {
        return a.name.localeCompare(b.name)
      }
      return 0
    })

  const totalParticipants = participants.length
  const checkedInCount = participants.filter(p => p.checked_in_at).length
  const checkInPercentage = totalParticipants > 0 
    ? Math.round((checkedInCount / totalParticipants) * 100)
    : 0

  const uniqueRoles = [...new Set(participants.map(p => p.role))]

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Participant Dashboard</h1>
          <p style={styles.subtitle}>Manage and track event participants</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </header>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Participants</div>
          <div style={styles.statValue}>{totalParticipants}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Checked In</div>
          <div style={styles.statValue}>{checkedInCount}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Check-in Rate</div>
          <div style={styles.statValue}>{checkInPercentage}%</div>
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controlsSection}>
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by name, email, or college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterControls}>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Roles</option>
            {uniqueRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="checkin_time">Latest Check-in</option>
            <option value="name">Name (A-Z)</option>
          </select>

          <button onClick={handleExport} style={styles.exportBtn}>
            Export CSV
          </button>

          <button onClick={fetchParticipants} style={styles.refreshBtn}>
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <p style={styles.loadingText}>Loading participants...</p>
        </div>
      ) : filteredAndSortedParticipants.length === 0 ? (
        <div style={styles.emptyContainer}>
          <p style={styles.emptyText}>
            {searchTerm || filterRole !== "all" ? "No participants found" : "No participants yet"}
          </p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.tableHeaderCell}>Name</th>
                <th style={styles.tableHeaderCell}>Email</th>
                <th style={styles.tableHeaderCell}>College</th>
                <th style={styles.tableHeaderCell}>Role</th>
                <th style={styles.tableHeaderCell}>Status</th>
                <th style={styles.tableHeaderCell}>Check-in Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedParticipants.map((participant, idx) => (
                <tr key={idx} style={styles.tableRow}>
                  <td style={styles.tableCell}>{participant.name}</td>
                  <td style={styles.tableCell}>{participant.email}</td>
                  <td style={styles.tableCell}>{participant.college}</td>
                  <td style={styles.tableCell}>
                    <span style={styles.roleBadge}>{participant.role}</span>
                  </td>
                  <td style={styles.tableCell}>
                    {participant.checked_in_at ? (
                      <span style={styles.statusBadgeCheckedIn}>✓ Checked In</span>
                    ) : (
                      <span style={styles.statusBadgePending}>Pending</span>
                    )}
                  </td>
                  <td style={styles.tableCell}>
                    {participant.checked_in_at 
                      ? new Date(participant.checked_in_at).toLocaleString()
                      : "—"
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Admin

/* ================== STYLES ================== */

const styles = {
  page: {
    fontFamily: "system-ui, sans-serif",
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
    fontSize: "28px",
    fontWeight: 700
  },
  subtitle: {
    margin: "6px 0 0 0",
    fontSize: "14px",
    opacity: 0.85
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
    transition: "all 0.2s",
    hover: {
      background: "rgba(255,255,255,0.15)"
    }
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px"
  },
  statCard: {
    background: "#1a1f26",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #2d3139",
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
  },
  statLabel: {
    fontSize: "13px",
    color: "#8b92a0",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  statValue: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#0077cc"
  },
  controlsSection: {
    background: "#1a1f26",
    padding: "16px",
    borderRadius: "10px",
    marginBottom: "24px",
    border: "1px solid #2d3139"
  },
  searchBox: {
    marginBottom: "12px"
  },
  searchInput: {
    width: "100%",
    padding: "10px 14px",
    background: "#0f1419",
    border: "1px solid #2d3139",
    borderRadius: "8px",
    color: "#e4e8eb",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.2s",
    "&:focus": {
      borderColor: "#0077cc"
    }
  },
  filterControls: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  filterSelect: {
    padding: "8px 12px",
    background: "#0f1419",
    border: "1px solid #2d3139",
    borderRadius: "8px",
    color: "#e4e8eb",
    fontSize: "13px",
    cursor: "pointer",
    outline: "none",
    transition: "border-color 0.2s"
  },
  exportBtn: {
    padding: "8px 14px",
    background: "#0077cc",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s"
  },
  refreshBtn: {
    padding: "8px 14px",
    background: "transparent",
    border: "1px solid #2d3139",
    borderRadius: "8px",
    color: "#e4e8eb",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s"
  },
  loadingContainer: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#1a1f26",
    borderRadius: "10px",
    border: "1px solid #2d3139"
  },
  loadingText: {
    color: "#8b92a0",
    fontSize: "14px",
    margin: 0
  },
  emptyContainer: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#1a1f26",
    borderRadius: "10px",
    border: "1px solid #2d3139"
  },
  emptyText: {
    color: "#8b92a0",
    fontSize: "14px",
    margin: 0
  },
  tableContainer: {
    background: "#1a1f26",
    borderRadius: "10px",
    border: "1px solid #2d3139",
    overflowX: "auto",
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  tableHeader: {
    background: "#0f1419",
    borderBottom: "1px solid #2d3139"
  },
  tableHeaderCell: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: 700,
    color: "#8b92a0",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  tableRow: {
    borderBottom: "1px solid #2d3139",
    transition: "background 0.15s",
    "&:hover": {
      background: "#242a33"
    }
  },
  tableCell: {
    padding: "14px 16px",
    fontSize: "13px",
    color: "#e4e8eb"
  },
  roleBadge: {
    display: "inline-block",
    padding: "4px 8px",
    background: "#1e3a5f",
    color: "#4fa3ff",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "capitalize"
  },
  statusBadgeCheckedIn: {
    display: "inline-block",
    padding: "4px 8px",
    background: "#1a3a2a",
    color: "#4ade80",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: 600
  },
  statusBadgePending: {
    display: "inline-block",
    padding: "4px 8px",
    background: "#3a3a1a",
    color: "#fbbf24",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: 600
  }
}
