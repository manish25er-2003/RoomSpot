import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import PortfolioPage from './pages/PortfolioPage'
import './App.css'

const AUTH_KEY = 'roomspot-auth'
const API_BASE = 'http://localhost:5000/api'

function readAuth() {
  try {
    const stored = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null')
    if (stored && stored.user) {
      return {
        user: stored.user,
        role: stored.role || stored.user.role || null,
        token: stored.token || null,
      }
    }
    return { user: null, role: null, token: null }
  } catch {
    return { user: null, role: null, token: null }
  }
}

function AuthPage({ mode, onSubmit }) {
  const isLogin = mode === 'login'
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', fullName: '' })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({
      ...form,
      mode: isLogin ? 'login' : 'register',
    })
  }

  return (
    <div className="auth-page-shell">
      <div className="auth-card">
        <div className="auth-logo" aria-label="RoomSpot logo">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </div>
          <span>RoomSpot</span>
        </div>

        <div className="auth-header">
          <div className="auth-kicker">{isLogin ? 'Welcome back' : 'Create account'}</div>
          <h2>{isLogin ? 'Sign in to RoomSpot' : 'Join RoomSpot'}</h2>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={isLogin ? 'active' : ''}
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            type="button"
            className={!isLogin ? 'active' : ''}
            onClick={() => navigate('/register')}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <label>
              Full name
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </label>

          <button type="submit" className="auth-submit-btn">
            {isLogin ? 'Login' : 'Create account'}
          </button>
        </form>

        <button type="button" className="auth-back-home" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    </div>
  )
}

function DashboardPage({ role, user, onLogout }) {
  const isAdmin = role === 'admin'
  const navItems = isAdmin
    ? ['Overview', 'Rooms', 'Tenants', 'Rent & payments', 'Complaints', 'Messages']
    : ['Overview', 'My room', 'Payments', 'Complaints', 'Messages']

  const [activeSection, setActiveSection] = useState('Overview')

  const quickActions = isAdmin
    ? [
        'Send rent reminder',
        'Review new inquiries',
        'Schedule inspection',
        'Publish listing',
      ]
    : [
        'Pay rent',
        'Request maintenance',
        'Chat with manager',
        'Update profile',
      ]

  const trendData = isAdmin
    ? [72, 88, 80, 95, 100, 84, 92]
    : [58, 70, 68, 82, 90, 76, 85]

  const [rooms, setRooms] = useState([
    { id: 1, name: 'Room 101', type: 'Private room', status: 'Occupied', rent: '₹12,000', occupancy: '92%' },
    { id: 2, name: 'Room 201', type: '1BHK', status: 'Available', rent: '₹18,500', occupancy: '100%' },
    { id: 3, name: 'PG Floor', type: 'Shared room', status: 'Occupied', rent: '₹7,500', occupancy: '88%' },
  ])

  const [tenants, setTenants] = useState([
    { id: 1, name: 'Aisha Khan', status: 'Verified', lease: '2 months', room: 'Room 101' },
    { id: 2, name: 'Rohit Verma', status: 'Pending', lease: '1 month', room: 'Room 205' },
    { id: 3, name: 'Neha Patel', status: 'Verified', lease: '5 months', room: 'PG Floor' },
  ])

  const [payments, setPayments] = useState([
    { id: 1, name: 'Monthly rent', owner: 'Aisha Khan', amount: '₹12,000', due: 'Paid', tag: 'success' },
    { id: 2, name: 'Security deposit', owner: 'Rohit Verma', amount: '₹8,000', due: 'Pending', tag: 'warning' },
    { id: 3, name: 'Maintenance', owner: 'Neha Patel', amount: '₹1,200', due: 'Paid', tag: 'success' },
  ])

  const [upiDetails, setUpiDetails] = useState({ adminUpiId: '' })

  const fetchAdminUpi = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/settings/payment')
      if (!response.ok) {
        return
      }
      const data = await response.json()
      setUpiDetails({ adminUpiId: data.adminUpiId || '7087338600@ybl' })
    } catch {
      setUpiDetails({ adminUpiId: '7087338600@ybl' })
    }
  }

  useEffect(() => {
    fetchAdminUpi()
  }, [])

  const [complaints, setComplaints] = useState([
    { id: 1, title: 'Water leakage', owner: 'Aisha Khan', status: 'Open', priority: 'High' },
    { id: 2, title: 'Fan repair', owner: 'Rohit Verma', status: 'In review', priority: 'Medium' },
    { id: 3, title: 'Wi-Fi issue', owner: 'Neha Patel', status: 'Resolved', priority: 'Low' },
  ])

  const [messages, setMessages] = useState([
    { id: 1, from: 'Owner', preview: 'The room inspection is scheduled for Friday.', unread: 2 },
    { id: 2, from: 'Support', preview: 'Your rent payment has been recorded.', unread: 0 },
    { id: 3, from: 'Manager', preview: 'Your complaint has been assigned to the team.', unread: 1 },
  ])

  const stats = isAdmin
    ? [
        { label: 'Total rooms', value: '128', trend: '+8% this month' },
        { label: 'Occupancy', value: '92%', trend: 'Healthy demand' },
        { label: 'Collections', value: '₹4.8L', trend: '+12% vs last month' },
        { label: 'Complaints', value: '14', trend: '7 open issues' },
      ]
    : [
        { label: 'My room', value: 'Room 102', trend: 'Ready to move in' },
        { label: 'Rent due', value: '₹3,000', trend: 'Due in 6 days' },
        { label: 'Requests', value: '3', trend: '1 pending review' },
        { label: 'Profile', value: 'Verified', trend: 'Lease active' },
      ]

  const markPaid = (id) => {
    setPayments((prev) => prev.map((item) => (item.id === id ? { ...item, due: 'Paid', tag: 'success' } : item)))
  }

  const handleTenantPayNow = async (payment) => {
    if (payment?.due !== 'Pending') {
      return
    }

    const nextUpi = upiDetails.adminUpiId || '7087338600@ybl'
    window.alert(`Pay to: ${nextUpi}`)
  }

  const resolveComplaint = (id) => {
    setComplaints((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'Resolved' } : item)))
  }

  const toggleRoomStatus = (id) => {
    setRooms((prev) => prev.map((room) => {
      if (room.id !== id) return room
      return {
        ...room,
        status: room.status === 'Available' ? 'Occupied' : 'Available',
      }
    }))
  }

  const readMessage = (id) => {
    setMessages((prev) => prev.map((message) => (message.id === id ? { ...message, unread: 0 } : message)))
  }

  const renderSection = () => {
    if (activeSection === 'Overview') {
      return (
        <>
          <div className="stats-grid">
            {stats.map((stat) => (
              <article key={stat.label} className="stat-card">
                <div className="stat-top">
                  <span>{stat.label}</span>
                  <i className="stat-icon">↗</i>
                </div>
                <strong>{stat.value}</strong>
                <div className="stat-change">{stat.trend}</div>
              </article>
            ))}
          </div>

          <div className="overview-layout">
            <div className="info-panel chart-panel">
              <div className="panel-heading">
                <div>
                  <h3>{isAdmin ? 'Performance overview' : 'Your trend'}</h3>
                  <p>{isAdmin ? 'Revenue and occupancy growth' : 'Your stay and payment trend'}</p>
                </div>
              </div>

              <div className="chart-bars" aria-label="Trend chart">
                {trendData.map((value, index) => (
                  <div key={index} className="chart-column">
                    <div className="chart-bar" style={{ height: `${value}%` }} />
                    <span>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-panel quick-panel">
              <div className="panel-heading">
                <div>
                  <h3>Quick actions</h3>
                  <p>Recommended next steps</p>
                </div>
              </div>

              <div className="quick-actions-list">
                {quickActions.map((action, index) => (
                  <button key={action} type="button" className="quick-action-item">
                    <span className="quick-icon">{index + 1}</span>
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="panel-grid">
            <div className="info-panel">
              <div className="panel-heading">
                <div>
                  <h3>Recent activity</h3>
                  <p>What has been happening lately</p>
                </div>
              </div>
              <ul className="activity-list">
                <li>New tenant onboarding completed.</li>
                <li>Maintenance check scheduled for Room 201.</li>
                <li>Rent collection updated successfully.</li>
              </ul>
            </div>

            <div className="info-panel">
              <div className="panel-heading">
                <div>
                  <h3>{isAdmin ? 'Property insights' : 'Your stay'}</h3>
                  <p>{isAdmin ? 'Performance snapshot' : 'Booking snapshot'}</p>
                </div>
              </div>
              <ul className="activity-list">
                <li>{isAdmin ? 'Occupancy remains strong.' : 'Your room is well maintained.'}</li>
                <li>{isAdmin ? '2 premium rooms are trending.' : 'Your rental payment is on track.'}</li>
                <li>{isAdmin ? 'Owner response time is under 3 hours.' : 'Support team is available for help.'}</li>
              </ul>
            </div>
          </div>
        </>
      )
    }

    if ((activeSection === 'Rooms' || activeSection === 'My room') && isAdmin) {
      return (
        <div className="content-card">
          <div className="content-header">
            <div>
              <h3>Room availability</h3>
              <p>Live property overview</p>
            </div>
            <button type="button" className="action-button primary">Add room</button>
          </div>

          <div className="data-table">
            <div className="table-head">
              <span>Room</span>
              <span>Type</span>
              <span>Rent</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {rooms.map((room) => (
              <div className="table-row" key={room.id}>
                <span>{room.name}</span>
                <span>{room.type}</span>
                <span>{room.rent}</span>
                <span><em className={`status-badge ${room.status === 'Available' ? 'success' : 'neutral'}`}>{room.status}</em></span>
                <span><button type="button" className="action-button small" onClick={() => toggleRoomStatus(room.id)}>{room.status === 'Available' ? 'Mark occupied' : 'Mark available'}</button></span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (activeSection === 'My room' && !isAdmin) {
      return (
        <div className="content-card">
          <div className="content-header">
            <div>
              <h3>Your room</h3>
              <p>Stay and lease details</p>
            </div>
            <button type="button" className="action-button primary">Request support</button>
          </div>

          <div className="room-summary">
            <div className="room-detail">
              <label>Room</label>
              <strong>Room 102</strong>
            </div>
            <div className="room-detail">
              <label>Monthly rent</label>
              <strong>₹3,000</strong>
            </div>
            <div className="room-detail">
              <label>Move-in status</label>
              <strong>Active</strong>
            </div>
            <div className="room-detail">
              <label>Maintenance</label>
              <strong>Scheduled</strong>
            </div>
          </div>
        </div>
      )
    }

    if (activeSection === 'Tenants' && isAdmin) {
      return (
        <div className="content-card">
          <div className="content-header">
            <div>
              <h3>Tenant records</h3>
              <p>Verification and stay details</p>
            </div>
            <button type="button" className="action-button primary">Add tenant</button>
          </div>

          <div className="data-table">
            <div className="table-head">
              <span>Name</span>
              <span>Room</span>
              <span>Lease</span>
              <span>Status</span>
            </div>
            {tenants.map((tenant) => (
              <div className="table-row" key={tenant.id}>
                <span>{tenant.name}</span>
                <span>{tenant.room}</span>
                <span>{tenant.lease}</span>
                <span><em className={`status-badge ${tenant.status === 'Verified' ? 'success' : 'warning'}`}>{tenant.status}</em></span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if ((activeSection === 'Payments' || activeSection === 'Rent & payments') && !isAdmin) {
      return (
        <div className="content-card">
          <div className="content-header">
            <div>
              <h3>Payments</h3>
              <p>Current dues and receipts</p>
            </div>
          </div>

          <div className="data-table">
            <div className="table-head">
              <span>Type</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {payments.map((payment) => (
              <div className="table-row" key={payment.id}>
                <span>{payment.name}</span>
                <span>{payment.amount}</span>
                <span><em className={`status-badge ${payment.tag === 'success' ? 'success' : 'warning'}`}>{payment.due}</em></span>
                <span>
                  {payment.due === 'Pending' ? (
                    <button type="button" className="action-button small" onClick={() => handleTenantPayNow(payment)}>Pay Now</button>
                  ) : (
                    <span className="muted-label">Completed</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (activeSection === 'Rent & payments' && isAdmin) {
      return (
        <div className="content-card">
          <div className="content-header">
            <div>
              <h3>Collections</h3>
              <p>Payment summary</p>
            </div>
          </div>

          <div className="data-table">
            <div className="table-head">
              <span>Owner</span>
              <span>Type</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {payments.map((payment) => (
              <div className="table-row" key={payment.id}>
                <span>{payment.owner}</span>
                <span>{payment.name}</span>
                <span>{payment.amount}</span>
                <span><em className={`status-badge ${payment.tag === 'success' ? 'success' : 'warning'}`}>{payment.due}</em></span>
                <span>
                  {payment.due === 'Pending' ? (
                    <button type="button" className="action-button small" onClick={() => markPaid(payment.id)}>Confirm</button>
                  ) : (
                    <span className="muted-label">Done</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (activeSection === 'Complaints') {
      return (
        <div className="content-card">
          <div className="content-header">
            <div>
              <h3>Complaints</h3>
              <p>{isAdmin ? 'Support queue' : 'Your reported issues'}</p>
            </div>
            <button type="button" className="action-button primary">New complaint</button>
          </div>

          <div className="task-list">
            {complaints.map((complaint) => (
              <div className="task-item" key={complaint.id}>
                <div>
                  <h4>{complaint.title}</h4>
                  <p>{complaint.owner}</p>
                </div>
                <div className="task-meta">
                  <span className="mini-tag">{complaint.priority}</span>
                  <span className={`status-badge ${complaint.status === 'Resolved' ? 'success' : complaint.status === 'Open' ? 'warning' : 'neutral'}`}>{complaint.status}</span>
                  {complaint.status !== 'Resolved' && (
                    <button type="button" className="action-button small" onClick={() => resolveComplaint(complaint.id)}>Resolve</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (activeSection === 'Messages') {
      return (
        <div className="content-card">
          <div className="content-header">
            <div>
              <h3>Messages</h3>
              <p>{isAdmin ? 'Owner and tenant updates' : 'Recent updates from your manager'}</p>
            </div>
          </div>

          <div className="task-list">
            {messages.map((message) => (
              <div className="task-item" key={message.id}>
                <div>
                  <h4>{message.from}</h4>
                  <p>{message.preview}</p>
                </div>
                <div className="task-meta">
                  {message.unread > 0 && <span className="unread-pill">{message.unread}</span>}
                  <button type="button" className="action-button small" onClick={() => readMessage(message.id)}>Reply</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-inner">
          <div className="dashboard-brand">
            <div className="brand-mark compact-mark">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <strong>RoomSpot</strong>
              <span>{isAdmin ? 'Admin panel' : 'Tenant portal'}</span>
            </div>
          </div>

          <div className="property-select">
            <div className="property-avatar">{(user?.name || 'RS').slice(0, 1).toUpperCase()}</div>
            <div>
              <b>{isAdmin ? 'RoomSpot Living' : 'My residence'}</b>
              <span>{isAdmin ? 'Property workspace' : 'Stay summary'}</span>
            </div>
            <span className="caret">⌄</span>
          </div>

          <div className="nav-caption">WORKSPACE</div>
          <nav className="dashboard-nav">
            {navItems.map((item) => (
              <button
                key={item}
                type="button"
                className={`nav-item ${activeSection === item ? 'active' : ''}`}
                onClick={() => setActiveSection(item)}
              >
                <span>{item === 'Overview' ? '▦' : item === 'Rooms' || item === 'My room' ? '⌂' : item === 'Payments' || item === 'Rent & payments' ? '₹' : item === 'Messages' ? '▢' : item === 'Complaints' ? '▤' : '♙'}</span>
                {item}
              </button>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="sidebar-card">
              <h4>{isAdmin ? 'Property status' : 'Stay status'}</h4>
              <p>{isAdmin ? '8 new inquiries this week.' : 'All documents verified and active.'}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button type="button" className="menu-btn" aria-label="Open menu">☰</button>
            <div className="breadcrumb">Workspace <span>/</span> <b>{isAdmin ? 'Admin dashboard' : 'Dashboard'}</b></div>
          </div>

          <div className="topbar-actions">
            <button type="button" className="topbar-button">Notifications</button>
            <div className="profile-pill">
              <span>{(user?.name || 'User').slice(0, 2).toUpperCase()}</span>
              <div>
                <strong>{user?.name || 'Guest User'}</strong>
                <small>{isAdmin ? 'Administrator' : 'Tenant'}</small>
              </div>
            </div>
            <button type="button" className="logout-button" onClick={onLogout}>Logout</button>
          </div>
        </header>

        <section className="dashboard-content">
          <div className="welcome-banner">
            <div className="welcome-symbol">✦</div>
            <div>
              <h2>{isAdmin ? 'Good morning, Admin 👋' : `Welcome home, ${user?.name?.split(' ')[0] || 'User'} 👋`}</h2>
              <p>{isAdmin ? 'Your property portfolio is performing well today.' : 'Your room, rent and requests are all in one place.'}</p>
            </div>
            <div className="welcome-decoration">⌂</div>
          </div>

          {isAdmin ? (
            <div className="dashboard-summary-strip">
              <div className="summary-pill accent">
                <span>Today</span>
                <strong>24 leads</strong>
              </div>
              <div className="summary-pill">
                <span>Occupancy</span>
                <strong>92%</strong>
              </div>
              <div className="summary-pill">
                <span>Collections</span>
                <strong>₹4.8L</strong>
              </div>
            </div>
          ) : (
            <div className="dashboard-summary-strip">
              <div className="summary-pill accent">
                <span>Lease</span>
                <strong>Active</strong>
              </div>
              <div className="summary-pill">
                <span>Rent due</span>
                <strong>₹3,000</strong>
              </div>
              <div className="summary-pill">
                <span>Support</span>
                <strong>On call</strong>
              </div>
            </div>
          )}

          {renderSection()}
        </section>
      </main>
    </div>
  )
}

function ProtectedRoute({ isAuthenticated, allowedRole, userRole, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />
  }

  return children
}

function AppRoutes({ auth, onLogin, onLogout }) {
  const isAuthenticated = Boolean(auth?.user && auth?.token)
  const userRole = auth?.role || auth?.user?.role || null

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home
            onLogin={() => window.location.assign('/login')}
            onRegister={() => window.location.assign('/register')}
            onListProperty={() => window.location.assign('/register')}
          />
        }
      />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/dashboard'} replace /> : <AuthPage mode="login" onSubmit={onLogin} />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/dashboard'} replace /> : <AuthPage mode="register" onSubmit={onLogin} />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} allowedRole="tenant" userRole={userRole}>
            <DashboardPage role="tenant" user={auth.user} onLogout={onLogout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} allowedRole="admin" userRole={userRole}>
            <DashboardPage role="admin" user={auth.user} onLogout={onLogout} />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  const [auth, setAuth] = useState(readAuth)

  useEffect(() => {
    document.title = 'RoomSpot | Find Rooms & Rentals'
  }, [])

  useEffect(() => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth))
  }, [auth])

  const handleAuth = async ({ mode, fullName, email, password }) => {
    const endpoint = mode === 'login' ? 'login' : 'register'
    const cleanedEmail = String(email || '').trim().toLowerCase()
    const cleanedPassword = String(password || '').trim()

    try {
      const response = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: cleanedEmail,
          password: cleanedPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        window.alert(data?.message || 'Authentication failed')
        return
      }

      if (mode === 'register') {
        window.alert('Registration successful. Please log in to continue.')
        window.location.assign('/login')
        return
      }

      const nextAuth = {
        user: data.user,
        role: data.user.role,
        token: data.token,
      }

      setAuth(nextAuth)

      if (data.user.role === 'admin') {
        window.location.assign('/admin/dashboard')
        return
      }

      window.location.assign('/dashboard')
    } catch (error) {
      console.error('Auth request failed:', error)
      window.alert('Unable to reach the server. Please check the backend connection.')
    }
  }

  const handleLogout = () => {
    setAuth({ user: null, role: null, token: null })
    window.location.assign('/')
  }

  return (
    <BrowserRouter>
      <AppRoutes auth={auth} onLogin={handleAuth} onLogout={handleLogout} />
    </BrowserRouter>
  )
}
