import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import PortfolioPage from './pages/PortfolioPage'
import { getApiBaseCandidates } from './lib/apiConfig'
import './App.css'

const AUTH_KEY = 'roomspot-auth'
const API_BASES = getApiBaseCandidates()
const API_BASE = API_BASES[0]

async function fetchWithApiFallback(path, options = {}) {
  const requestOptions = options || {}
  const candidates = API_BASES.length ? API_BASES : ['/api']

  let lastError
  for (const base of candidates) {
    const url = base.startsWith('http') ? `${base}${path}` : `${base}${path}`

    try {
      const response = await fetch(url, requestOptions)
      if (response.ok || response.status >= 400) {
        return response
      }
    } catch (error) {
      lastError = error
    }
  }

  if (lastError) {
    throw lastError
  }

  throw new Error('No API endpoint available')
}

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

function calculateStayDays(startDate, today) {
  if (!startDate) return null
  const start = new Date(startDate)
  const current = new Date(today)
  start.setHours(0, 0, 0, 0)
  current.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor((current - start) / 86400000))
}

function DashboardPage({ role, user, onLogout }) {
  const isAdmin = role === 'admin'
  const navItems = isAdmin
    ? ['Overview', 'Rooms', 'Tenants', 'Rent & payments', 'Complaints', 'Messages']
    : ['Overview', 'My room', 'Payments', 'Complaints', 'Messages']

  const [activeSection, setActiveSection] = useState('Overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stayRecords, setStayRecords] = useState([])
  const [serverTenants, setServerTenants] = useState(null)
  const [availableRooms, setAvailableRooms] = useState([])
  const [serverPayments, setServerPayments] = useState(null)
  const [today, setToday] = useState(() => new Date())
  const [showTenantForm, setShowTenantForm] = useState(false)
  const [tenantForm, setTenantForm] = useState({ name: '', email: '', password: '', phone: '', roomId: '' })
  const [savingTenant, setSavingTenant] = useState(false)

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

  const overviewMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const overviewRequestData = [0.82, 0.56, 0.7, 0.96, 1.18, 0.9, 1.36, 1.12, 0.94, 1.28, 0.76, 0.84]
  const overviewErrorData = [18, 14, 20, 16, 28, 12, 17, 15, 22, 10, 16, 9]
  const overviewActivity = [
    { title: 'Room 201 rent reminder sent', time: '2 hours ago', tone: 'info' },
    { title: 'Maintenance request closed', time: 'Today', tone: 'success' },
    { title: 'Tenant move-in scheduled', time: 'Yesterday', tone: 'warning' },
  ]

  const [rooms, setRooms] = useState([
    { id: 1, name: 'Room 101', type: 'Private room', status: 'Occupied', rent: '₹12,000', occupancy: '92%' },
    { id: 2, name: 'Room 201', type: '1BHK', status: 'Available', rent: '₹18,500', occupancy: '100%' },
    { id: 3, name: 'PG Floor', type: 'Shared room', status: 'Occupied', rent: '₹7,500', occupancy: '88%' },
  ])

  const availableRoomChoices = (availableRooms.length ? availableRooms : rooms).filter((room) => {
    const roomStatus = String(room?.status || '').toLowerCase()
    const hasTenant = Boolean(room?.tenant)
    return roomStatus === 'available' && !hasTenant
  })

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
  const [upiInput, setUpiInput] = useState('')

  const fetchAdminUpi = async () => {
    try {
      const response = await fetchWithApiFallback('/settings/payment')
      if (!response.ok) {
        return
      }
      const data = await response.json()
      const next = data.adminUpiId || '7087338600@ybl'
      setUpiDetails({ adminUpiId: next })
      setUpiInput(next)
    } catch {
      const fallback = '7087338600@ybl'
      setUpiDetails({ adminUpiId: fallback })
      setUpiInput(fallback)
    }
  }

  useEffect(() => {
    fetchAdminUpi()
  }, [])

  useEffect(() => {
    let mounted = true
    const token = readAuth().token
    const headers = { Authorization: `Bearer ${token}` }

    const loadDashboardData = async () => {
      const requests = [
        fetchWithApiFallback('/users/stays', { headers }),
        fetchWithApiFallback('/payments', { headers }),
      ]
      if (isAdmin) {
        requests.push(fetchWithApiFallback('/users', { headers }), fetchWithApiFallback('/rooms', { headers }))
      }

      try {
        const responses = await Promise.all(requests)
        if (!mounted) return
        if (responses[0].ok) {
          const data = await responses[0].json()
          setStayRecords(data.stays || [])
        }
        if (responses[1].ok) {
          const data = await responses[1].json()
          setServerPayments(data.payments || [])
        }
        if (isAdmin && responses[2]?.ok) {
          const data = await responses[2].json()
          setServerTenants(data.users || [])
        }
        if (isAdmin && responses[3]?.ok) {
          const data = await responses[3].json()
          setAvailableRooms(data.rooms || [])
          setRooms((data.rooms || []).map((room) => ({
            id: room._id,
            name: room.number,
            type: room.type,
            status: room.status,
            rent: `₹${Number(room.rent || 0).toLocaleString('en-IN')}`,
          })))
        }
      } catch {
        // Keep the existing local dashboard data available if the API is offline.
      }
    }

    loadDashboardData()
    return () => { mounted = false }
  }, [isAdmin])

  useEffect(() => {
    let midnightTimer
    const scheduleNextDay = () => {
      const now = new Date()
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      midnightTimer = window.setTimeout(() => {
        setToday(new Date())
        scheduleNextDay()
      }, nextMidnight.getTime() - now.getTime() + 100)
    }
    scheduleNextDay()
    return () => window.clearTimeout(midnightTimer)
  }, [])

  const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(today)
  const currentTenantPayments = (serverPayments || []).filter((payment) => payment.month === currentMonth)
  const userId = user?.id || user?._id || readAuth().user?.id || readAuth().user?._id || ''
  const tenantCurrentPayments = currentTenantPayments.filter((payment) => {
    const paymentTenantId = typeof payment.tenant === 'object' ? payment.tenant?._id : payment.tenant
    return String(paymentTenantId || '') === String(userId || '')
  })
  const tenantPaymentSummary = (tenantCurrentPayments.length ? tenantCurrentPayments : [
    { type: 'Room Rent', amount: 0, status: 'Pending' },
    { type: 'Electricity Bill', amount: 0, status: 'Pending' },
    { type: 'Water Bill', amount: 0, status: 'Pending' },
    { type: 'Security Charge', amount: 0, status: 'Pending' },
  ]).map((payment) => ({
    label: payment.type || payment.label || 'Payment',
    amount: Number(payment.amount || 0),
    status: payment.status || 'Pending',
  }))
  const tenantTotalDue = tenantPaymentSummary
    .filter((item) => item.status === 'Pending')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const hasPendingTenantPayment = tenantPaymentSummary.some((item) => item.status === 'Pending')

  const [complaints, setComplaints] = useState([
    { id: 1, title: 'Water leakage', owner: 'Aisha Khan', status: 'Open', priority: 'High' },
    { id: 2, title: 'Fan repair', owner: 'Rohit Verma', status: 'In review', priority: 'Medium' },
    { id: 3, title: 'Wi-Fi issue', owner: 'Neha Patel', status: 'Resolved', priority: 'Low' },
  ])

  const [complaintForm, setComplaintForm] = useState({
    title: '',
    category: 'Maintenance',
    description: '',
  })
  const [showComplaintForm, setShowComplaintForm] = useState(false)

  const [messages, setMessages] = useState([
    { id: 1, from: 'Owner', preview: 'The room inspection is scheduled for Friday.', unread: 2, time: '10:24 AM', subject: 'Inspection update' },
    { id: 2, from: 'Support', preview: 'Your rent payment has been recorded.', unread: 0, time: 'Yesterday', subject: 'Payment confirmation' },
    { id: 3, from: 'Manager', preview: 'Your complaint has been assigned to the team.', unread: 1, time: 'Mon', subject: 'Maintenance follow-up' },
  ])
  const [selectedMessageId, setSelectedMessageId] = useState(1)
  const [replyText, setReplyText] = useState('')

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

  const markPaid = async (id) => {
    const token = readAuth().token
    try {
      const response = await fetchWithApiFallback(`/payments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'Paid' }),
      })
      const data = await response.json()
      if (!response.ok) {
        window.alert(data?.message || 'Unable to update payment status')
        return
      }
      setServerPayments((prev) => (prev || []).map((payment) => (
        payment._id === id ? { ...payment, ...data.payment, status: 'Paid' } : payment
      )))
      window.alert('Payment marked as paid.')
    } catch {
      window.alert('Unable to reach the server. Please check the backend connection.')
    }
  }

  const handleTenantPayNow = async (payment) => {
    if (!payment || (payment.status || payment.due) !== 'Pending') {
      return
    }

    const token = readAuth().token
    try {
      const response = await fetchWithApiFallback(`/payments/${payment._id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          method: 'UPI',
          transactionId: `UPI-${Date.now()}`,
          transactionDetails: { source: 'tenant payment confirmation' },
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        window.alert(data?.message || 'Unable to complete payment')
        return
      }

      setServerPayments((prev) => (prev || []).map((entry) => (
        entry._id === payment._id ? { ...entry, ...data.payment, status: 'Paid' } : entry
      )))
      window.alert('Payment completed successfully.')
    } catch {
      const nextUpi = upiDetails.adminUpiId || '7087338600@ybl'
      window.alert(`Unable to reach the server. Pay to: ${nextUpi}`)
    }
  }

  const handleTenantPaymentRowPay = () => {
    const pendingPayment = (serverPayments || []).find((payment) => payment.month === currentMonth && (payment.status || payment.due) === 'Pending' && String(typeof payment.tenant === 'object' ? payment.tenant?._id : payment.tenant || '') === String(userId || ''))
    if (pendingPayment) {
      handleTenantPayNow(pendingPayment)
      return
    }

    const nextUpi = upiDetails.adminUpiId || '7087338600@ybl'
    window.alert(`Pay to: ${nextUpi}`)
  }

  const handleSaveAdminUpi = async () => {
    const nextValue = (upiInput || '').trim() || '7087338600@ybl'
    const token = readAuth().token

    try {
      const response = await fetchWithApiFallback('/settings/payment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminUpiId: nextValue }),
      })

      const data = await response.json()
      if (!response.ok) {
        window.alert(data?.message || 'Unable to update UPI ID')
        return
      }

      setUpiDetails({ adminUpiId: data.adminUpiId || nextValue })
      setUpiInput(data.adminUpiId || nextValue)
      window.alert('Admin UPI ID updated successfully.')
    } catch {
      window.alert('Unable to reach the server. Please check the backend connection.')
    }
  }

  const handleTenantFormChange = (event) => {
    const { name, value } = event.target
    setTenantForm((current) => ({ ...current, [name]: value }))
  }

  const handleAddTenant = async (event) => {
    event.preventDefault()
    setSavingTenant(true)
    const token = readAuth().token
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

    try {
      const response = await fetchWithApiFallback('/users', {
        method: 'POST',
        headers,
        body: JSON.stringify(tenantForm),
      })
      const data = await response.json()
      if (!response.ok) {
        window.alert(data?.message || 'Unable to add tenant')
        return
      }

      if (tenantForm.roomId) {
        const assignResponse = await fetchWithApiFallback(`/rooms/${tenantForm.roomId}/assign`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ tenantId: data.user.id }),
        })
        const assignData = await assignResponse.json()
        if (!assignResponse.ok) {
          window.alert(`Tenant account created, but room assignment failed: ${assignData?.message || 'Please assign a room from the Rooms section.'}`)
        }
      }

      setTenantForm({ name: '', email: '', password: '', phone: '', roomId: '' })
      setShowTenantForm(false)
      const [usersResponse, roomsResponse, staysResponse, paymentsResponse] = await Promise.all([
        fetchWithApiFallback('/users', { headers }),
        fetchWithApiFallback('/rooms', { headers }),
        fetchWithApiFallback('/users/stays', { headers }),
        fetchWithApiFallback('/payments', { headers }),
      ])
      if (usersResponse.ok) setServerTenants((await usersResponse.json()).users || [])
      if (roomsResponse.ok) {
        const nextRooms = (await roomsResponse.json()).rooms || []
        setAvailableRooms(nextRooms)
        setRooms(nextRooms.map((room) => ({
          id: room._id,
          name: room.number,
          type: room.type,
          status: room.status,
          rent: `₹${Number(room.rent || 0).toLocaleString('en-IN')}`,
        })))
      }
      if (staysResponse.ok) setStayRecords((await staysResponse.json()).stays || [])
      if (paymentsResponse.ok) setServerPayments((await paymentsResponse.json()).payments || [])
    } catch {
      window.alert('Unable to reach the server. Please check the backend connection.')
    } finally {
      setSavingTenant(false)
    }
  }

  const handleComplaintFieldChange = (event) => {
    const { name, value } = event.target
    setComplaintForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateComplaint = () => {
    const title = complaintForm.title.trim()
    if (!title) {
      window.alert('Please enter a complaint title.')
      return
    }

    const newComplaint = {
      id: Date.now(),
      title,
      owner: user?.name || 'Tenant',
      status: 'Open',
      priority: complaintForm.category,
    }

    setComplaints((prev) => [newComplaint, ...prev])
    setComplaintForm({ title: '', category: 'Maintenance', description: '' })
    setShowComplaintForm(false)
    setActiveSection('Complaints')
    window.alert('Complaint submitted successfully.')
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

  const activeMessage = messages.find((message) => message.id === selectedMessageId) || messages[0]

  const readMessage = (id) => {
    setSelectedMessageId(id)
    setMessages((prev) => prev.map((message) => (message.id === id ? { ...message, unread: 0 } : message)))
  }

  const sendReply = () => {
    const trimmed = replyText.trim()
    if (!trimmed) return

    setMessages((prev) => prev.map((message) => {
      if (message.id !== selectedMessageId) return message
      return {
        ...message,
        preview: trimmed,
        unread: 0,
        time: 'Just now',
      }
    }))
    setReplyText('')
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

          <div className="monitor-grid">
            <div className="monitor-panel dark-panel">
              <div className="monitor-header">
                <div>
                  <span className="monitor-label">Total API Requests</span>
                </div>
                <button type="button" className="monitor-filter">All API Keys</button>
              </div>

              <div className="monitor-body">
                <div className="monitor-value">
                  <strong>1.5K</strong>
                  <span>Requests</span>
                </div>
                <div className="monitor-axis">
                  <span>1.5K</span>
                  <span>1K</span>
                  <span>0.5K</span>
                  <span>0</span>
                </div>
                <div className="monitor-chart" aria-label="API requests chart">
                  {overviewRequestData.map((value, index) => (
                    <div key={`request-${index}`} className="monitor-column">
                      <div className="monitor-bar monitor-bar-primary" style={{ height: `${value * 100}%` }} />
                    </div>
                  ))}
                </div>
                <div className="monitor-scale">
                  <span>UTC-8</span>
                  <span>Sep 10</span>
                  <span>Sep 17</span>
                  <span>Sep 24</span>
                </div>
              </div>

              <div className="monitor-legend">
                <span><i className="legend-dot blue" /> Default Gemini API Key</span>
                <span><i className="legend-dot green" /> Success rate</span>
              </div>
            </div>

            <div className="monitor-panel dark-panel">
              <div className="monitor-header">
                <div>
                  <span className="monitor-label">Total API Errors</span>
                </div>
                <span className="monitor-mini-icon">⌁</span>
              </div>

              <div className="monitor-body">
                <div className="monitor-value">
                  <strong>150</strong>
                  <span>Errors</span>
                </div>
                <div className="monitor-axis">
                  <span>150</span>
                  <span>100</span>
                  <span>50</span>
                  <span>0</span>
                </div>
                <div className="monitor-chart" aria-label="API error chart">
                  {overviewErrorData.map((value, index) => (
                    <div key={`error-${index}`} className="monitor-column">
                      <div className="monitor-bar monitor-bar-pink" style={{ height: `${Math.max(20, value)}%` }} />
                    </div>
                  ))}
                </div>
                <div className="monitor-scale">
                  <span>UTC-8</span>
                  <span>Sep 10</span>
                  <span>Sep 17</span>
                  <span>Sep 24</span>
                </div>
              </div>

              <div className="monitor-legend stacked-legend">
                <span><i className="legend-dot pink" /> 400 BadRequest</span>
                <span><i className="legend-dot blue" /> 404 NotFound</span>
                <span><i className="legend-dot green" /> 429 TooManyRequests</span>
                <span><i className="legend-dot purple" /> 500 InternalServerError</span>
              </div>
            </div>
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
                    <div className="chart-bar" style={{ height: `${value}%` }} data-label={`${overviewMonths[index % overviewMonths.length]} ${new Date().getFullYear()}`}>
                      <span className="chart-hover-label">{overviewMonths[index % overviewMonths.length]}</span>
                    </div>
                    <span>{overviewMonths[index % overviewMonths.length]}</span>
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
              <div className="activity-feed">
                {overviewActivity.map((item) => (
                  <div key={item.title} className={`activity-item ${item.tone}`}>
                    <span className="activity-dot" />
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-panel">
              <div className="panel-heading">
                <div>
                  <h3>{isAdmin ? 'Stay overview' : 'Your stay'}</h3>
                  <p>{isAdmin ? 'Active room occupancy' : 'Stay summary'}</p>
                </div>
              </div>
              <div className="stay-compact-list">
                {stayRecords.length ? stayRecords.slice(0, 3).map((stay) => (
                  <div className="stay-compact-item" key={stay.tenantId}>
                    <div>
                      <strong>{isAdmin ? stay.tenantName : 'Room stay'}</strong>
                      <small>Room {stay.roomNumber}</small>
                    </div>
                    <div className="stay-compact-meta">
                      <span>{stay.rentStartDate ? `${calculateStayDays(stay.rentStartDate, today)} Days` : '—'}</span>
                      <em>{stay.rentStartDate ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(stay.rentStartDate)) : 'Not started'}</em>
                    </div>
                  </div>
                )) : (
                  <div className="stay-empty-inline">{isAdmin ? 'No active tenant stays yet.' : 'A stay summary will appear here when a room is assigned.'}</div>
                )}
              </div>
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
            <button
              type="button"
              className="action-button primary"
              onClick={() => {
                setActiveSection('Complaints')
                setShowComplaintForm(true)
              }}
            >
              Request support
            </button>
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
            <button type="button" className="action-button primary" onClick={() => setShowTenantForm((open) => !open)}>
              {showTenantForm ? 'Cancel' : 'Add tenant'}
            </button>
          </div>

          {showTenantForm && (
            <div className="tenant-form-panel">
              <div className="tenant-form-header">
                <div>
                  <h3>Add new tenant</h3>
                  <p>Create the tenant account and optionally assign an available room.</p>
                </div>
                <button type="button" className="mini-link-button" onClick={() => setShowTenantForm(false)}>
                  Cancel
                </button>
              </div>

              <form className="tenant-form" onSubmit={handleAddTenant}>
                <div className="tenant-form-grid">
                  <label className="tenant-field">
                    <span className="field-label">Tenant name</span>
                    <input name="name" value={tenantForm.name} onChange={handleTenantFormChange} placeholder="John Smith" required />
                  </label>

                  <label className="tenant-field">
                    <span className="field-label">Email address</span>
                    <input name="email" type="email" value={tenantForm.email} onChange={handleTenantFormChange} placeholder="tenant@gmail.com" required />
                  </label>

                  <label className="tenant-field">
                    <span className="field-label">Temporary password</span>
                    <input name="password" type="password" minLength="6" value={tenantForm.password} onChange={handleTenantFormChange} placeholder="Minimum 6 characters" required />
                  </label>

                  <label className="tenant-field">
                    <span className="field-label">Phone</span>
                    <input name="phone" type="tel" value={tenantForm.phone} onChange={handleTenantFormChange} placeholder="Optional" />
                  </label>

                  <label className="tenant-field tenant-field-wide">
                    <span className="field-label">Assign room (optional)</span>
                    <select name="roomId" value={tenantForm.roomId} onChange={handleTenantFormChange} disabled={!availableRoomChoices.length}>
                      <option value="">{availableRoomChoices.length ? 'Add without assigning' : 'No rooms available right now'}</option>
                      {availableRoomChoices.map((room) => (
                        <option key={room._id || room.id} value={room._id || room.id}>
                          {room.number || room.name} · ₹{Number(room.rent || 0).toLocaleString('en-IN')}/month
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="tenant-form-actions">
                  <button type="submit" className="action-button primary" disabled={savingTenant}>
                    {savingTenant ? 'Saving…' : 'Add tenant'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="data-table">
            <div className="table-head">
              <span>Name</span>
              <span>Room</span>
              <span>Lease</span>
              <span>Status</span>
            </div>
            {(serverTenants || tenants).map((tenant) => (
              <div className="table-row" key={tenant._id || tenant.id}>
                <span>{tenant.name}</span>
                <span>{tenant.room?.number || tenant.room || 'Unassigned'}</span>
                <span>{tenant.rentStartDate ? `${calculateStayDays(tenant.rentStartDate, today)} days` : (tenant.lease || 'Not started')}</span>
                <span><em className={`status-badge ${tenant.isActive === false || tenant.status === 'Pending' ? 'warning' : 'success'}`}>{tenant.isActive === false ? 'Inactive' : (tenant.status || 'Active')}</em></span>
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

          <div className="tenant-payment-row-wrap">
            <div className="tenant-payment-row">
              {tenantPaymentSummary.map((item) => (
                <div key={item.label} className="tenant-payment-item">
                  <span className="tenant-payment-label">{item.label}</span>
                  <strong>₹{item.amount.toLocaleString('en-IN')}</strong>
                </div>
              ))}

              <div className="tenant-payment-total">
                <span>Total</span>
                <strong>₹{tenantTotalDue.toLocaleString('en-IN')}</strong>
              </div>

              <div className="tenant-payment-action">
                {hasPendingTenantPayment ? (
                  <button type="button" className="action-button primary pay-row-button" onClick={handleTenantPaymentRowPay}>Pay Now</button>
                ) : (
                  <span className="status-badge success pay-row-badge">Paid</span>
                )}
              </div>
            </div>
          </div>

          <div className="data-table">
            <div className="table-head">
              <span>Type</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {(serverPayments && serverPayments.length ? serverPayments.filter((payment) => payment.month === currentMonth && String(typeof payment.tenant === 'object' ? payment.tenant?._id : payment.tenant || '') === String(userId || '')) : payments).map((payment) => {
              const normalized = {
                id: payment._id || payment.id,
                type: payment.type || payment.name || 'Payment',
                amount: `₹${Number(payment.amount || 0).toLocaleString('en-IN')}`,
                status: payment.status || payment.due || 'Pending',
              }
              return (
                <div className="table-row" key={normalized.id}>
                  <span>{normalized.type}</span>
                  <span>{normalized.amount}</span>
                  <span><em className={`status-badge ${normalized.status === 'Paid' ? 'success' : 'warning'}`}>{normalized.status}</em></span>
                  <span>
                    {normalized.status === 'Pending' ? (
                      <button type="button" className="action-button small" onClick={() => handleTenantPayNow(payment)}>Pay Now</button>
                    ) : (
                      <span className="muted-label">Completed</span>
                    )}
                  </span>
                </div>
              )
            })}
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

          <div className="upi-settings-panel">
            <label>
              Admin UPI ID
              <input
                type="text"
                value={upiInput}
                onChange={(event) => setUpiInput(event.target.value)}
                placeholder="Enter UPI ID"
              />
            </label>
            <button type="button" className="action-button primary" onClick={handleSaveAdminUpi}>Update UPI</button>
          </div>

          <div className="data-table">
            <div className="table-head">
              <span>Owner</span>
              <span>Type</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {(serverPayments && serverPayments.length ? serverPayments.filter((payment) => payment.month === currentMonth) : payments).map((payment) => {
              const normalized = {
                id: payment._id || payment.id,
                owner: payment.tenant?.name || payment.owner || 'Tenant',
                type: payment.type || payment.name || 'Payment',
                amount: `₹${Number(payment.amount || 0).toLocaleString('en-IN')}`,
                status: payment.status || payment.due || 'Pending',
              }
              return (
                <div className="table-row" key={normalized.id}>
                  <span>{normalized.owner}</span>
                  <span>{normalized.type}</span>
                  <span>{normalized.amount}</span>
                  <span><em className={`status-badge ${normalized.status === 'Paid' ? 'success' : 'warning'}`}>{normalized.status}</em></span>
                  <span>
                    {normalized.status === 'Pending' ? (
                      <button type="button" className="action-button small" onClick={() => markPaid(normalized.id)}>Confirm</button>
                    ) : (
                      <span className="muted-label">Done</span>
                    )}
                  </span>
                </div>
              )
            })}
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
            <button type="button" className="action-button primary" onClick={() => setShowComplaintForm((prev) => !prev)}>New complaint</button>
          </div>

          {showComplaintForm && (
            <div className="complaint-form-panel">
              <div className="complaint-form-grid">
                <label>
                  Complaint title
                  <input
                    type="text"
                    name="title"
                    value={complaintForm.title}
                    onChange={handleComplaintFieldChange}
                    placeholder="Describe the issue"
                  />
                </label>

                <label>
                  Category
                  <select name="category" value={complaintForm.category} onChange={handleComplaintFieldChange}>
                    <option>Maintenance</option>
                    <option>Water</option>
                    <option>Electricity</option>
                    <option>Cleaning</option>
                    <option>Plumbing</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Details
                  <textarea
                    name="description"
                    value={complaintForm.description}
                    onChange={handleComplaintFieldChange}
                    placeholder="Add more details for the support team"
                  />
                </label>
              </div>

              <div className="complaint-form-actions">
                <button type="button" className="action-button small" onClick={() => setShowComplaintForm(false)}>Cancel</button>
                <button type="button" className="action-button primary" onClick={handleCreateComplaint}>Submit complaint</button>
              </div>
            </div>
          )}

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
        <div className="content-card messages-card">
          <div className="content-header">
            <div>
              <h3>Messages</h3>
              <p>{isAdmin ? 'Owner and tenant updates' : 'Recent updates from your manager'}</p>
            </div>
          </div>

          <div className="messages-panel">
            <div className="message-list">
              {messages.map((message) => (
                <button
                  type="button"
                  key={message.id}
                  className={`message-item ${selectedMessageId === message.id ? 'active' : ''}`}
                  onClick={() => readMessage(message.id)}
                >
                  <div className="message-item-top">
                    <strong>{message.from}</strong>
                    <span>{message.time}</span>
                  </div>
                  <div className="message-item-row">
                    <span className="message-subject">{message.subject}</span>
                    {message.unread > 0 && <span className="unread-pill">{message.unread}</span>}
                  </div>
                  <p>{message.preview}</p>
                </button>
              ))}
            </div>

            <div className="message-thread">
              <div className="message-thread-header">
                <div>
                  <span className="message-thread-label">Conversation</span>
                  <h4>{activeMessage?.from}</h4>
                </div>
                <span className="mini-tag">{activeMessage?.subject}</span>
              </div>

              <div className="message-thread-body">
                <div className="thread-bubble incoming">
                  <strong>{activeMessage?.from}</strong>
                  <p>{activeMessage?.preview}</p>
                </div>
                <div className="thread-bubble outgoing">
                  <strong>You</strong>
                  <p>{replyText.trim() || 'Reply to confirm the next action or update the tenant.'}</p>
                </div>
              </div>

              <div className="message-reply-box">
                <textarea
                  rows="4"
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  placeholder="Type a reply..."
                />
                <div className="message-actions">
                  <button type="button" className="ghost-btn" onClick={() => setReplyText('')}>Clear</button>
                  <button type="button" className="action-button primary" onClick={sendReply}>Send reply</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className={`dashboard-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
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
                onClick={() => {
                  setActiveSection(item)
                  setSidebarOpen(false)
                }}
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
            <button type="button" className="menu-btn" aria-label="Toggle menu" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
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
              <div className="summary-pill support-pill">
                <span>Support</span>
                <strong>On call</strong>
                <div className="support-actions">
                  <a href="tel:+917087338600" className="support-link call-link">Call</a>
                  <a href="https://wa.me/917087338600?text=Hello%20I%20need%20support" target="_blank" rel="noreferrer" className="support-link whatsapp-link">WhatsApp</a>
                </div>
              </div>
            </div>
          )}

          <section className="stay-overview-panel" aria-label="Current tenant stays">
            <div className="stay-overview-heading">
              <div>
                <span className="stay-overview-kicker">Stay tracking</span>
                <h3>{isAdmin ? 'Current tenant stays' : 'Your current stay'}</h3>
              </div>
              {isAdmin && <span className="stay-live-indicator">Updated daily</span>}
            </div>

            {stayRecords.length ? (
              <div className="stay-overview-list">
                {stayRecords.map((stay) => (
                  <article className="stay-overview-row" key={stay.tenantId}>
                    <div className="stay-person-room">
                      <strong>{isAdmin ? stay.tenantName : 'Room stay'}</strong>
                      <span>Room {stay.roomNumber}</span>
                    </div>
                    <div className="stay-date-value">
                      <span>Rent start date</span>
                      <strong>{stay.rentStartDate ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(stay.rentStartDate)) : 'Not recorded'}</strong>
                    </div>
                    <div className="stay-duration-value">
                      <span>Current Stay</span>
                      <strong>{stay.rentStartDate ? `${calculateStayDays(stay.rentStartDate, today)} Days` : '—'}</strong>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="stay-empty-state">{isAdmin ? 'No tenants have an assigned room yet.' : 'A stay summary will appear here when a room is assigned to your account.'}</p>
            )}
          </section>

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
      const response = await fetchWithApiFallback(`/auth/${endpoint}`, {
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
