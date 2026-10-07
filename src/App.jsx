import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import PortfolioPage from './pages/PortfolioPage'
import { getApiBaseCandidates } from './lib/apiConfig'
import './App.css'
import { io as ioClient } from 'socket.io-client'

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
    ? ['Overview', 'Rooms', 'Tenants', 'Rent & payments', 'Complaints', 'Calendar', 'Messages']
    : ['Overview', 'My room', 'Payments', 'Complaints', 'Calendar', 'Messages']

  const [activeSection, setActiveSection] = useState('Overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stayRecords, setStayRecords] = useState([])

  const getNavLabel = (item) => {
    if (item === 'Rent & payments') return 'Pay'
    if (item === 'Payments') return 'Pay'
    if (item === 'Messages') return 'Msg'
    if (item === 'Complaints') return 'Issues'
    if (item === 'My room') return 'Room'
    if (item === 'Tenants') return 'Tenants'
    return item
  }
  const [serverTenants, setServerTenants] = useState(null)
  const [availableRooms, setAvailableRooms] = useState([])
  const [serverPayments, setServerPayments] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [demoTenantId, setDemoTenantId] = useState('')
  const [animatedPaymentId, setAnimatedPaymentId] = useState(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [expandedPaymentId, setExpandedPaymentId] = useState(null)
  const [showSad, setShowSad] = useState(false)
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

  const [showAddRoomForm, setShowAddRoomForm] = useState(false)
  const [roomForm, setRoomForm] = useState({ number: '', type: 'Private room', rent: '', status: 'Available' })

  const handleRoomFormChange = (e) => {
    const { name, value } = e.target
    setRoomForm((cur) => ({ ...cur, [name]: value }))
  }

  const handleAddRoom = async (event) => {
    event.preventDefault()
    const token = readAuth().token
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    try {
      const response = await fetchWithApiFallback('/rooms', {
        method: 'POST',
        headers,
        body: JSON.stringify({ number: roomForm.number, type: roomForm.type, rent: Number(roomForm.rent || 0), status: roomForm.status }),
      })
      const data = await response.json()
      if (!response.ok) {
        window.alert(data?.message || 'Unable to add room')
        return
      }

      // refresh rooms from server
      const roomsResp = await fetchWithApiFallback('/rooms', { headers })
      if (roomsResp.ok) {
        const list = (await roomsResp.json()).rooms || []
        setRooms(list.map((room) => ({ id: room._id, name: room.number, type: room.type, status: room.status, rent: `₹${Number(room.rent || 0).toLocaleString('en-IN')}` })))
      }

      setRoomForm({ number: '', type: 'Private room', rent: '', status: 'Available' })
      setShowAddRoomForm(false)
      window.alert('Room added successfully')
    } catch (err) {
      window.alert('Unable to reach server. Check backend.')
    }
  }

  // Assign room modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assignRoomId, setAssignRoomId] = useState(null)
  const [assignForm, setAssignForm] = useState({ tenantId: '', rent: '', rentStartDate: '' })

  const openAssignModal = (room) => {
    const parsedRent = room && room.rent ? Number(String(room.rent).replace(/[^0-9]/g, '')) : ''
    setAssignRoomId(room?.id || null)
    setAssignForm({ tenantId: '', rent: parsedRent || '', rentStartDate: '' })
    setAssignModalOpen(true)
  }

  const openAssignToTenant = (tenant) => {
    setAssignRoomId(null)
    setAssignForm({ tenantId: tenant._id || tenant.id || '', rent: '', rentStartDate: '' })
    setAssignModalOpen(true)
  }

  const handleAssignFormChange = (e) => {
    const { name, value } = e.target
    setAssignForm((cur) => ({ ...cur, [name]: value }))
  }

  const handleAssignRoom = async (e) => {
    e.preventDefault()
    if (!assignRoomId) return
    const token = readAuth().token
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    try {
      const body = {
        tenantId: assignForm.tenantId || undefined,
        rent: assignForm.rent ? Number(assignForm.rent) : undefined,
        rentStartDate: assignForm.rentStartDate || undefined,
      }

      const resp = await fetchWithApiFallback(`/rooms/${assignRoomId}/assign`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      })
      const data = await resp.json()
      if (!resp.ok) {
        window.alert(data?.message || 'Unable to assign room')
        return
      }

      // Refresh rooms, tenants, stays and payments
      const [roomsResp, usersResp, staysResp, paymentsResp] = await Promise.all([
        fetchWithApiFallback('/rooms', { headers }),
        fetchWithApiFallback('/users', { headers }),
        fetchWithApiFallback('/users/stays', { headers }),
        fetchWithApiFallback('/payments', { headers }),
      ])
      if (roomsResp.ok) setRooms((await roomsResp.json()).rooms.map((room) => ({ id: room._id, name: room.number, type: room.type, status: room.status, rent: `₹${Number(room.rent || 0).toLocaleString('en-IN')}` })))
      if (usersResp.ok) setServerTenants((await usersResp.json()).users || [])
      if (staysResp.ok) setStayRecords((await staysResp.json()).stays || [])
      if (paymentsResp.ok) setServerPayments((await paymentsResp.json()).payments || [])

      setAssignModalOpen(false)
      setAssignRoomId(null)
      setAssignForm({ tenantId: '', rent: '', rentStartDate: '' })
      window.alert('Room assigned successfully')
      // refresh auth user so local auth reflects new room assignment
      try {
        await refreshAuthUser()
      } catch (e) {
        // ignore
      }
    } catch (err) {
      window.alert('Unable to reach server. Check backend.')
    }
  }

  const refreshAuthUser = async () => {
    try {
      const auth = readAuth()
      if (!auth?.token) return
      const headers = { Authorization: `Bearer ${auth.token}` }
      const resp = await fetchWithApiFallback('/auth/me', { headers })
      if (resp.ok) {
        const d = await resp.json()
        const next = { user: d.user, role: d.user.role, token: auth.token }
        localStorage.setItem(AUTH_KEY, JSON.stringify(next))
        return next
      }
    } catch (e) {
      // ignore
    }
  }

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
    refreshIssues()
    refreshIssueStats()
    // start a short payments polling loop to keep dashboards in sync
    let pollTimer
    const startPolling = () => {
      pollTimer = setInterval(async () => {
        try {
          const resp = await fetchWithApiFallback('/payments', { headers })
          if (!mounted || !resp.ok) return
          const json = await resp.json()
          const next = json.payments || []
          // simple detection of change
          const prev = serverPayments || []
          const prevIds = (prev || []).map((p) => p._id || p.id).join(',')
          const nextIds = (next || []).map((p) => p._id || p.id).join(',')
          if (prevIds !== nextIds) {
            setServerPayments(next)
            setToastMessage('Payments updated')
            setShowToast(true)
            window.setTimeout(() => setShowToast(false), 3500)
          }
          // also poll stays so tenant dashboards reflect recent assignments
          try {
            const staysResp = await fetchWithApiFallback('/users/stays', { headers })
            if (mounted && staysResp.ok) {
              const staysJson = await staysResp.json()
              const nextStays = staysJson.stays || []
              const prevStayIds = (stayRecords || []).map((s) => s.tenantId).join(',')
              const nextStayIds = (nextStays || []).map((s) => s.tenantId).join(',')
              if (prevStayIds !== nextStayIds) {
                setStayRecords(nextStays)
                setToastMessage('Stays updated')
                setShowToast(true)
                window.setTimeout(() => setShowToast(false), 3500)
              }
            }
          } catch (e) {
            // ignore stays polling errors
          }

          try {
            await refreshIssues()
            if (isAdmin) await refreshIssueStats()
          } catch (e) {
            // ignore issue polling errors
          }
        } catch (e) {
          // ignore polling errors
        }
      }, 10000)
    }

    let socket
    const startSocket = () => {
      try {
        socket = ioClient(API_BASES[0] || '/', { transports: ['websocket'] })
        // identify this socket with the JWT token so the server can place it in the user's room
        try {
          const auth = readAuth()
          if (auth?.token && socket && socket.connected) {
            socket.emit('identify', auth.token)
          } else if (auth?.token) {
            // if not connected yet, emit once connected
            socket.on('connect', () => socket.emit('identify', auth.token))
          }
        } catch (e) {
          // ignore identify errors
        }
        socket.on('connect', () => {
          // console.log('socket connected', socket.id)
        })
        socket.on('room:assigned', (payload) => {
          // refresh stays and payments when assignment happens
          if (payload?.tenantId && String(payload.tenantId) === String(userId || '')) {
            // this is for current logged-in tenant
            setToastMessage('A room was assigned to you')
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
          }
          // refresh lists
          fetchWithApiFallback('/users/stays', { headers }).then((r) => r.ok && r.json().then((d) => setStayRecords(d.stays || []))).catch(() => {})
          fetchWithApiFallback('/payments', { headers }).then((r) => r.ok && r.json().then((d) => setServerPayments(d.payments || []))).catch(() => {})
        })
        socket.on('payment:updated', (payload) => {
          // update payments list
          if (payload?.payment) {
            const p = payload.payment
            setServerPayments((prev) => {
              const next = (prev || []).map((item) => (String(item._id || item.id) === String(p._id || p.id) ? p : item))
              if (!next.find((x) => String(x._id || x.id) === String(p._id || p.id))) next.unshift(p)
              return next
            })
            setToastMessage('Payment updated')
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
          }
        })
      } catch (e) {
        // ignore socket init errors
      }
    }

    if (token) {
      startPolling()
      startSocket()
    }
    return () => { mounted = false; if (pollTimer) clearInterval(pollTimer); if (socket) socket.disconnect() }
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
  const parseAmount = (val) => {
    if (val === null || val === undefined) return 0
    if (typeof val === 'number') return val
    const cleaned = String(val).replace(/[^0-9.-]+/g, '')
    const num = Number(cleaned)
    return Number.isFinite(num) ? num : 0
  }
  const [calendarView, setCalendarView] = useState('month')
  const [calendarSelectedDate, setCalendarSelectedDate] = useState(new Date())
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthStartWeekday = (startOfMonth.getDay() + 6) % 7
  const monthDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const calendarEventSeed = [
    { id: 1, title: 'Rent due', type: 'rent', date: new Date(today.getFullYear(), today.getMonth(), 5), time: '10:00 AM' },
    { id: 2, title: 'Maintenance visit', type: 'maintenance', date: new Date(today.getFullYear(), today.getMonth(), 11), time: '2:30 PM' },
    { id: 3, title: 'Room inspection', type: 'inspection', date: new Date(today.getFullYear(), today.getMonth(), 18), time: '9:00 AM' },
    { id: 4, title: 'Community meeting', type: 'event', date: new Date(today.getFullYear(), today.getMonth(), 22), time: '6:00 PM' },
    { id: 5, title: 'Payment reminder', type: 'payment', date: new Date(today.getFullYear(), today.getMonth(), 27), time: '9:15 AM' },
  ]
  const isSameDay = (left, right) => left && right && left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate()
  const getCalendarCells = () => {
    const cells = []
    const totalCells = 42
    const firstDate = new Date(today.getFullYear(), today.getMonth(), 1 - monthStartWeekday)
    for (let index = 0; index < totalCells; index += 1) {
      const cellDate = new Date(firstDate)
      cellDate.setDate(firstDate.getDate() + index)
      cells.push(cellDate)
    }
    return cells
  }
  const calendarCells = getCalendarCells()
  const calendarEvents = calendarEventSeed.map((event) => ({ ...event, date: new Date(event.date) }))
  const selectedDateEvents = calendarEvents.filter((event) => isSameDay(event.date, calendarSelectedDate))
  const monthEvents = calendarEvents.filter((event) => event.date.getMonth() === today.getMonth() && event.date.getFullYear() === today.getFullYear())
  const currentTenantPayments = (serverPayments || []).filter((payment) => payment.month === currentMonth)
  const userId = user?.id || user?._id || readAuth().user?.id || readAuth().user?._id || ''
  const tenantCurrentPayments = currentTenantPayments.filter((payment) => {
    const paymentTenantId = typeof payment.tenant === 'object' ? payment.tenant?._id : payment.tenant
    return String(paymentTenantId || '') === String(userId || '')
  })
  const paymentOrder = ['Security Charge', 'Water Bill', 'Electricity Bill', 'Room Rent']
  const tenantPaymentSummary = [...tenantCurrentPayments]
    .map((payment) => ({
      label: payment.type || payment.label || 'Payment',
      amount: parseAmount(payment.amount || 0),
      status: payment.status || 'Pending',
    }))
    .sort((a, b) => {
      const aIndex = paymentOrder.indexOf(a.label)
      const bIndex = paymentOrder.indexOf(b.label)
      if (aIndex === -1 && bIndex === -1) return 0
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
  const tenantTotalDue = tenantPaymentSummary.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const hasPendingTenantPayment = tenantPaymentSummary.some((item) => item.status === 'Pending')

  const [complaints, setComplaints] = useState([])
  const [complaintForm, setComplaintForm] = useState({
    title: '',
    category: 'Maintenance',
    priority: 'High',
    roomNumber: '',
    description: '',
    attachment: '',
  })
  const [showComplaintForm, setShowComplaintForm] = useState(false)
  const [selectedIssueId, setSelectedIssueId] = useState(null)
  const [selectedIssueDetail, setSelectedIssueDetail] = useState(null)
  const [issueMessages, setIssueMessages] = useState([])
  const [issueReplyText, setIssueReplyText] = useState('')
  const [issueSummary, setIssueSummary] = useState({ total: 0, open: 0, inReview: 0, inProgress: 0, resolved: 0 })

  useEffect(() => {
    if (!selectedIssueDetail) return
    const issueId = selectedIssueDetail._id || selectedIssueDetail.id
    if (!issueId) return
    loadIssueThread({ ...selectedIssueDetail, _id: issueId })
  }, [selectedIssueDetail])

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
        { label: 'Complaints', value: String(issueSummary.total || 0), trend: `${issueSummary.open || 0} open issues` },
      ]
    : [
        { label: 'My room', value: 'Room 102', trend: 'Ready to move in' },
        { label: 'Rent due', value: '₹3,000', trend: 'Due in 6 days' },
        { label: 'Requests', value: String(complaints.filter((item) => item.status !== 'Resolved').length || 0), trend: 'Issue requests' },
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
        // show sad animation for failed payment
        setToastMessage(data?.message || 'Unable to complete payment')
        setShowToast(true)
        setShowSad(true)
        setTimeout(() => setShowSad(false), 2500)
        setTimeout(() => setShowToast(false), 3500)
        return
      }

      // update local payments list
      setServerPayments((prev) => (prev || []).map((entry) => (
        entry._id === payment._id ? { ...entry, ...data.payment, status: 'Paid' } : entry
      )))
      // show celebration animation and highlight the paid row
      setAnimatedPaymentId(payment._id)
      setShowCelebration(true)
      setToastMessage(`Payment received: ₹${Number(payment.amount || data.payment?.amount || 0).toLocaleString('en-IN')}`)
      setShowToast(true)
      window.setTimeout(() => {
        setShowToast(false)
      }, 3500)
      window.setTimeout(() => {
        setShowCelebration(false)
        setAnimatedPaymentId(null)
      }, 3000)
      // also fetch latest payments for admin/tenant views
      try {
        const token = readAuth().token
        const headers = { Authorization: `Bearer ${token}` }
        const resp = await fetchWithApiFallback('/payments', { headers })
        if (resp.ok) setServerPayments((await resp.json()).payments || [])
      } catch (e) {
        // ignore
      }
      window.alert('Payment completed successfully.')
    } catch {
      const nextUpi = upiDetails.adminUpiId || '7087338600@ybl'
      setToastMessage(`Network error — pay to: ${nextUpi}`)
      setShowToast(true)
      setShowSad(true)
      setTimeout(() => setShowSad(false), 2500)
      setTimeout(() => setShowToast(false), 3500)
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

  const refreshIssues = async () => {
    const token = readAuth().token
    if (!token) return

    try {
      const response = await fetchWithApiFallback(isAdmin ? '/complaints' : '/complaints/my', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok) {
        setComplaints([])
        return
      }
      const normalized = (data.complaints || []).map((item) => ({
        _id: item._id,
        id: item.issueId || item._id,
        issueId: item.issueId || item._id,
        title: item.title,
        owner: item.tenant?.name || 'Tenant',
        tenant: item.tenant,
        room: item.room?.number || item.roomNumber || 'N/A',
        priority: item.priority || 'Medium',
        status: item.status || 'Open',
        category: item.category || 'Maintenance',
        description: item.description || '',
        createdAt: item.createdAt,
        resolvedAt: item.resolvedAt,
        adminResponse: item.adminResponse || '',
      }))
      setComplaints(normalized)
      if (selectedIssueId) {
        const selected = normalized.find((item) => item._id === selectedIssueId || item.id === selectedIssueId)
        if (selected) setSelectedIssueDetail(selected)
      }
    } catch {
      setComplaints([])
    }
  }

  const refreshIssueStats = async () => {
    if (!isAdmin) return
    const token = readAuth().token
    if (!token) return

    try {
      const response = await fetchWithApiFallback('/complaints/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (response.ok) setIssueSummary(data.stats || { total: 0, open: 0, inReview: 0, inProgress: 0, resolved: 0 })
    } catch {
      // ignore stats fetch failures
    }
  }

  const loadIssueThread = async (issue) => {
    const token = readAuth().token
    if (!token || !issue) return
    try {
      const response = await fetchWithApiFallback(`/complaints/${issue._id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (response.ok) {
        setIssueMessages(data.messages || [])
      }
    } catch {
      setIssueMessages([])
    }
  }

  const handleComplaintFieldChange = (event) => {
    const { name, value } = event.target
    setComplaintForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateComplaint = async () => {
    const title = complaintForm.title.trim()
    if (!title) {
      window.alert('Please enter a complaint title.')
      return
    }
    if (!complaintForm.description.trim()) {
      window.alert('Please enter a complaint description.')
      return
    }

    const token = readAuth().token
    try {
      const response = await fetchWithApiFallback('/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          category: complaintForm.category,
          priority: complaintForm.priority,
          roomNumber: complaintForm.roomNumber,
          description: complaintForm.description,
          attachment: complaintForm.attachment,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        window.alert(data?.message || 'Unable to submit complaint')
        return
      }
      setComplaintForm({ title: '', category: 'Maintenance', priority: 'High', roomNumber: '', description: '', attachment: '' })
      setShowComplaintForm(false)
      setActiveSection('Complaints')
      await refreshIssues()
      if (isAdmin) await refreshIssueStats()
      window.alert('Complaint submitted successfully.')
    } catch {
      window.alert('Unable to reach the server. Please check the backend connection.')
    }
  }

  const resolveComplaint = async (issueOrId) => {
    const issue = typeof issueOrId === 'object' ? issueOrId : complaints.find((item) => String(item._id || item.id) === String(issueOrId))
    if (!issue) return

    const issueId = issue._id || issue.id
    const token = readAuth().token
    const resolution = window.prompt('Resolution message (optional):', issue.adminResponse || 'Issue resolved.') || issue.adminResponse || 'Issue resolved.'
    try {
      const response = await fetchWithApiFallback(`/complaints/${issueId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminResponse: resolution }),
      })
      const data = await response.json()
      if (!response.ok) {
        window.alert(data?.message || 'Unable to resolve issue')
        return
      }
      await refreshIssues()
      if (isAdmin) await refreshIssueStats()
      setSelectedIssueDetail((prev) => ({ ...prev, status: 'Resolved', adminResponse: resolution }))
      await loadIssueThread({ ...issue, _id: issueId })
    } catch {
      window.alert('Unable to update issue status.')
    }
  }

  const handleIssueReply = async () => {
    if (!selectedIssueDetail || !issueReplyText.trim()) return
    const issueId = selectedIssueDetail._id || selectedIssueDetail.id
    const token = readAuth().token
    try {
      const response = await fetchWithApiFallback(`/complaints/${issueId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: issueReplyText.trim() }),
      })
      const data = await response.json()
      if (!response.ok) {
        window.alert(data?.message || 'Unable to send reply')
        return
      }
      setIssueReplyText('')
      await loadIssueThread(selectedIssueDetail)
    } catch {
      window.alert('Unable to send a message right now.')
    }
  }

  const toggleRoomStatus = async (id) => {
    const token = readAuth().token
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const current = rooms.find((r) => r.id === id)
    if (!current) return
    const nextStatus = current.status === 'Available' ? 'Occupied' : 'Available'

    try {
      const resp = await fetchWithApiFallback(`/rooms/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: nextStatus }),
      })
      const data = await resp.json()
      if (!resp.ok) {
        window.alert(data?.message || 'Unable to update room status')
        return
      }

      // Update UI from server response
      const updated = data.room || { _id: id, status: nextStatus }
      setRooms((prev) => prev.map((room) => (room.id === id ? { ...room, status: updated.status } : room)))
    } catch (e) {
      window.alert('Unable to reach server. Please check connection.')
    }
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
            <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
              <button type="button" className="action-button primary" onClick={() => setShowAddRoomForm((s) => !s)}>
                {showAddRoomForm ? 'Cancel' : 'Add room'}
              </button>
            </div>
          </div>

          {showAddRoomForm && (
            <div className="content-card" style={{marginTop: 10}}>
              <form className="tenant-form" onSubmit={handleAddRoom}>
                <div className="tenant-form-grid">
                  <label className="tenant-field">
                    <span className="field-label">Room number</span>
                    <input name="number" value={roomForm.number} onChange={handleRoomFormChange} placeholder="e.g. 305" required />
                  </label>

                  <label className="tenant-field">
                    <span className="field-label">Type</span>
                    <select name="type" value={roomForm.type} onChange={handleRoomFormChange}>
                      <option>Private room</option>
                      <option>Shared room</option>
                      <option>1BHK</option>
                      <option>2BHK</option>
                    </select>
                  </label>

                  <label className="tenant-field">
                    <span className="field-label">Monthly rent (₹)</span>
                    <input name="rent" value={roomForm.rent} onChange={handleRoomFormChange} type="number" placeholder="3000" />
                  </label>

                  <label className="tenant-field">
                    <span className="field-label">Status</span>
                    <select name="status" value={roomForm.status} onChange={handleRoomFormChange}>
                      <option>Available</option>
                      <option>Occupied</option>
                      <option>Maintenance</option>
                    </select>
                  </label>
                </div>

                <div className="tenant-form-actions">
                  <button type="submit" className="action-button primary">Create room</button>
                </div>
              </form>
            </div>
          )}

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
                <span style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                  <button type="button" className="action-button small" onClick={() => toggleRoomStatus(room.id)}>{room.status === 'Available' ? 'Mark occupied' : 'Mark available'}</button>
                  <button type="button" className="action-button small" onClick={() => openAssignModal(room)}>Assign</button>
                </span>
              </div>
            ))}
          </div>
          {/* Assign room modal */}
          {assignModalOpen && (
            <div className="modal-overlay" style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60}}>
              <div className="modal-card" style={{background: '#fff', borderRadius: 8, padding: 18, width: 520, maxWidth: '95%'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                  <div>
                    <h3 style={{margin: 0}}>Assign room</h3>
                    <small>Choose a tenant and start the rent</small>
                  </div>
                  <button type="button" className="mini-link-button" onClick={() => setAssignModalOpen(false)}>Close</button>
                </div>

                <form onSubmit={handleAssignRoom}>
                  <div style={{display: 'grid', gap: 10}}>
                    <label>
                      Tenant
                      <select name="tenantId" value={assignForm.tenantId} onChange={handleAssignFormChange} required>
                        <option value="">Select tenant</option>
                        {(serverTenants || []).map((t) => (
                          <option key={t._id || t.id} value={t._id || t.id}>{t.name || (t.fullName || t.email)}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Rent (₹)
                      <input name="rent" type="number" value={assignForm.rent} onChange={handleAssignFormChange} placeholder="Monthly rent" />
                    </label>

                    <label>
                      Rent start date
                      <input name="rentStartDate" type="date" value={assignForm.rentStartDate} onChange={handleAssignFormChange} />
                    </label>

                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8}}>
                      <button type="button" className="action-button" onClick={() => setAssignModalOpen(false)}>Cancel</button>
                      <button type="submit" className="action-button primary">Assign room</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
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
                <span style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                  <em className={`status-badge ${tenant.isActive === false || tenant.status === 'Pending' ? 'warning' : 'success'}`}>{tenant.isActive === false ? 'Inactive' : (tenant.status || 'Active')}</em>
                  {isAdmin && <button type="button" className="action-button small" onClick={() => openAssignToTenant(tenant)}>Assign</button>}
                </span>
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
            <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
              {isAdmin && (
                <>
                  <select value={demoTenantId} onChange={(e) => setDemoTenantId(e.target.value)}>
                    <option value="">Select tenant (demo)</option>
                    {(serverTenants || []).map((t) => (
                      <option key={t._id || t.id} value={t._id || t.id}>{t.name || t.email}</option>
                    ))}
                  </select>
                  <button type="button" className="action-button" onClick={async () => {
                    if (!demoTenantId) { window.alert('Choose a tenant first'); return }
                    try {
                      const token = readAuth().token
                      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
                      const demo = [
                        { type: 'Room Rent', amount: 3000, month: currentMonth, dueDate: new Date(), status: 'Pending' },
                        { type: 'Electricity Bill', amount: 250, month: currentMonth, dueDate: new Date(), status: 'Pending' },
                        { type: 'Water Bill', amount: 120, month: currentMonth, dueDate: new Date(), status: 'Paid' },
                      ]
                      for (const p of demo) {
                        await fetchWithApiFallback('/payments', { method: 'POST', headers, body: JSON.stringify({ tenantId: demoTenantId, ...p }) })
                      }
                      const resp = await fetchWithApiFallback('/payments', { headers })
                      if (resp.ok) setServerPayments((await resp.json()).payments || [])
                      setToastMessage('Demo payments added')
                      setShowToast(true)
                      setTimeout(() => setShowToast(false), 3000)
                    } catch (err) {
                      // ignore
                    }
                  }}>Add demo payments</button>
                </>
              )}
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
                  <button type="button" className="action-button primary pay-row-button" onClick={handleTenantPaymentRowPay}>
                    <span className="pay-icon" aria-hidden>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        <path d="M6 9h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        <path d="M6 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        <path d="M17 9v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        <circle cx="18.5" cy="11" r="1" fill="currentColor" />
                      </svg>
                    </span>
                    <span className="pay-label">Pay Rent</span>
                  </button>
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
              const rawAmount = payment.amount || 0
              const amountNum = parseAmount(rawAmount)
              const normalized = {
                id: payment._id || payment.id,
                type: payment.type || payment.name || 'Payment',
                amount: `₹${Number(amountNum).toLocaleString('en-IN')}`,
                status: payment.status || payment.due || 'Pending',
              }
              return (
                <div key={normalized.id}>
                  <div className={`table-row ${animatedPaymentId === payment._id ? 'paid-animate' : ''}`} onClick={() => setExpandedPaymentId(expandedPaymentId === payment._id ? null : payment._id)}>
                    <span>{normalized.type}</span>
                    <span>{normalized.amount}</span>
                    <span><em className={`status-badge ${normalized.status === 'Paid' ? 'success' : 'warning'}`}>{normalized.status}</em></span>
                    <span>
                      {normalized.status === 'Pending' ? (
                        <button type="button" className="action-button small" onClick={(e) => { e.stopPropagation(); handleTenantPayNow(payment) }}>
                          <span className="pay-icon" aria-hidden>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                              <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                              <path d="M6 9h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                              <path d="M6 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                              <circle cx="17.5" cy="10.8" r="0.9" fill="currentColor" />
                            </svg>
                          </span>
                          <span className="pay-label">Pay</span>
                        </button>
                      ) : (
                        <span className="muted-label">Completed</span>
                      )}
                    </span>
                  </div>

                  {expandedPaymentId === payment._id && (
                    <div className="payment-expanded" style={{padding: 14, border: '1px solid #eef2f7', borderRadius: 10, margin: '8px 0 12px', display: 'flex', gap: 12, alignItems: 'center'}}>
                      <div style={{width: 80, height: 80, borderRadius: 8, background: '#fff', border: '1px solid #e6eefc', display: 'grid', placeItems: 'center'}} className="payment-expanded">
                        <img
                          src="/icons/payment-placeholder.png"
                          alt="receipt"
                          className={(expandedPaymentId === payment._id || animatedPaymentId === payment._id) ? 'pop-animate' : ''}
                          style={{width: 56, height: 56, objectFit: 'cover'}}
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      </div>
                      <div style={{flex: 1}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                          <strong>{normalized.type}</strong>
                          <small style={{color:'#7b8aa3'}}>{normalized.status}</small>
                        </div>
                        <div style={{marginTop:8}}>
                          <div>Amount: <b>{normalized.amount}</b></div>
                          <div>Month: <b>{payment.month || currentMonth}</b></div>
                          <div>Due date: <b>{payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : '—'}</b></div>
                        </div>
                      </div>
                    </div>
                  )}
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
            <button type="button" className="action-button primary" onClick={() => setShowComplaintForm((prev) => !prev)}>
              <span className="header-btn-icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="header-btn-label">New complaint</span>
            </button>
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
              <div className="task-item" key={complaint.id} onClick={() => setSelectedIssueDetail(complaint)} style={{ cursor: 'pointer' }}>
                <div>
                  <h4>{complaint.title}</h4>
                  <p>{complaint.owner}</p>
                </div>
                <div className="task-meta">
                  <span className="mini-tag">{complaint.priority}</span>
                  <span className={`status-badge ${complaint.status === 'Resolved' ? 'success' : complaint.status === 'Open' ? 'warning' : 'neutral'}`}>{complaint.status}</span>
                  {complaint.status !== 'Resolved' && (
                    <button type="button" className="action-button small" onClick={(event) => { event.stopPropagation(); resolveComplaint(complaint) }}>Resolve</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedIssueDetail && (
            <div className="complaint-thread-panel">
              <div className="message-thread-header">
                <div>
                  <span className="message-thread-label">Issue thread</span>
                  <h4>{selectedIssueDetail.title}</h4>
                </div>
                <div className="task-meta">
                  <span className="mini-tag">{selectedIssueDetail.issueId || selectedIssueDetail.id}</span>
                  <span className={`status-badge ${selectedIssueDetail.status === 'Resolved' ? 'success' : selectedIssueDetail.status === 'Open' ? 'warning' : 'neutral'}`}>{selectedIssueDetail.status}</span>
                </div>
              </div>

              <div className="complaint-thread-meta">
                <span>Category: {selectedIssueDetail.category}</span>
                <span>Priority: {selectedIssueDetail.priority}</span>
                <span>Room: {selectedIssueDetail.room || 'N/A'}</span>
              </div>

              <div className="complaint-thread-description">
                <p>{selectedIssueDetail.description || 'No description provided.'}</p>
                {selectedIssueDetail.adminResponse && (
                  <div className="complaint-admin-response">
                    <strong>Admin response:</strong>
                    <p>{selectedIssueDetail.adminResponse}</p>
                  </div>
                )}
              </div>

              <div className="message-thread-body">
                {(issueMessages || []).map((message) => (
                  <div key={message._id || message.messageId} className={`thread-message ${message.sender?._id === userId ? 'mine' : ''}`}>
                    <span>{message.sender?.name || 'System'}:</span>
                    <p>{message.body}</p>
                  </div>
                ))}
              </div>

              <div className="complaint-reply-box">
                <textarea
                  value={issueReplyText}
                  onChange={(event) => setIssueReplyText(event.target.value)}
                  placeholder="Write a reply to the issue thread..."
                />
                <div className="complaint-form-actions">
                  {isAdmin && selectedIssueDetail.status !== 'Resolved' && (
                    <button type="button" className="action-button small" onClick={() => resolveComplaint(selectedIssueDetail)}>Resolve issue</button>
                  )}
                  <button type="button" className="action-button primary" onClick={handleIssueReply}>Send reply</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    if (activeSection === 'Calendar') {
      const activeCalendarDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(calendarSelectedDate)
      const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const visibleWeek = (() => {
        const start = new Date(calendarSelectedDate)
        const day = (start.getDay() + 6) % 7
        start.setDate(start.getDate() - day)
        return Array.from({ length: 7 }, (_, index) => {
          const date = new Date(start)
          date.setDate(start.getDate() + index)
          return date
        })
      })()

      return (
        <div className="content-card calendar-card">
          <div className="content-header">
            <div>
              <h3>Calendar</h3>
              <p>Upcoming room and maintenance schedule</p>
            </div>
            <div className="calendar-toolbar">
              <div className="calendar-toggle" aria-label="Calendar view toggle">
                {['month', 'week', 'agenda'].map((view) => (
                  <button
                    key={view}
                    type="button"
                    className={calendarView === view ? 'active' : ''}
                    onClick={() => setCalendarView(view)}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>
              <button type="button" className="action-button primary small" onClick={() => {
                const todayDate = new Date()
                setCalendarSelectedDate(todayDate)
                setCalendarView('month')
              }}>
                Today
              </button>
            </div>
          </div>

          <div className="calendar-layout">
            <div className="calendar-panel">
              <div className="calendar-header-row">
                <button type="button" className="calendar-nav-button" onClick={() => {
                  const next = new Date(calendarSelectedDate)
                  next.setMonth(next.getMonth() - 1)
                  setCalendarSelectedDate(next)
                }}>←</button>
                <strong>{new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(calendarSelectedDate)}</strong>
                <button type="button" className="calendar-nav-button" onClick={() => {
                  const next = new Date(calendarSelectedDate)
                  next.setMonth(next.getMonth() + 1)
                  setCalendarSelectedDate(next)
                }}>→</button>
              </div>

              {calendarView === 'month' && (
                <>
                  <div className="calendar-weekdays">
                    {weekDays.map((day) => <span key={day}>{day}</span>)}
                  </div>
                  <div className="calendar-grid">
                    {calendarCells.map((date, index) => {
                      const eventsForDay = calendarEvents.filter((event) => isSameDay(event.date, date))
                      const isCurrentMonth = date.getMonth() === calendarSelectedDate.getMonth()
                      const isToday = isSameDay(date, new Date())
                      const isSelected = isSameDay(date, calendarSelectedDate)

                      return (
                        <button
                          key={`${date.toISOString()}-${index}`}
                          type="button"
                          className={`calendar-day ${isCurrentMonth ? '' : 'muted'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                          onClick={() => setCalendarSelectedDate(date)}
                        >
                          <span className="calendar-day-number">{date.getDate()}</span>
                          <div className="calendar-day-events">
                            {eventsForDay.slice(0, 2).map((event) => (
                              <span key={event.id} className={`calendar-event-dot ${event.type}`} title={event.title} />
                            ))}
                            {eventsForDay.length > 2 && <span className="calendar-more">+{eventsForDay.length - 2}</span>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              {calendarView === 'week' && (
                <div className="calendar-week-view">
                  {visibleWeek.map((date) => {
                    const eventsForDay = calendarEvents.filter((event) => isSameDay(event.date, date))
                    const isToday = isSameDay(date, new Date())
                    const isSelected = isSameDay(date, calendarSelectedDate)
                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        className={`calendar-week-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                        onClick={() => setCalendarSelectedDate(date)}
                      >
                        <span className="calendar-week-title">{new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(date)}</span>
                        <strong>{date.getDate()}</strong>
                        <div className="calendar-week-events">
                          {eventsForDay.slice(0, 2).map((event) => (
                            <span key={event.id} className={`calendar-event-dot ${event.type}`} title={event.title} />
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {calendarView === 'agenda' && (
                <div className="calendar-agenda-list">
                  {monthEvents.length ? monthEvents.map((event) => (
                    <div key={event.id} className={`calendar-agenda-item ${event.type}`}>
                      <span className={`calendar-event-dot ${event.type}`} />
                      <div>
                        <strong>{event.title}</strong>
                        <small>{new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(event.date)} · {event.time}</small>
                      </div>
                    </div>
                  )) : <p className="empty-state-light">No events scheduled this month.</p>}
                </div>
              )}
            </div>

            <aside className="calendar-side-panel">
              <div className="calendar-side-header">
                <div>
                  <span className="calendar-side-label">Selected date</span>
                  <h4>{activeCalendarDate}</h4>
                </div>
              </div>

              <div className="calendar-event-list">
                {selectedDateEvents.length ? selectedDateEvents.map((event) => (
                  <div key={event.id} className="calendar-event-item">
                    <span className={`calendar-event-dot ${event.type}`} />
                    <div>
                      <strong>{event.title}</strong>
                      <small>{event.time}</small>
                    </div>
                  </div>
                )) : <p className="empty-state-light">No events scheduled.</p>}
              </div>

              <div className="calendar-legend">
                <span><i className="calendar-event-dot rent" /> Rent</span>
                <span><i className="calendar-event-dot maintenance" /> Maintenance</span>
                <span><i className="calendar-event-dot inspection" /> Inspection</span>
                <span><i className="calendar-event-dot event" /> Event</span>
              </div>
            </aside>
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
            <button
              type="button"
              className="action-button primary"
              onClick={() => {
                setActiveSection('Complaints')
                setShowComplaintForm(true)
              }}
            >
              <span className="header-btn-icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="header-btn-label">New complaint</span>
            </button>
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
              {/* Toast and celebration overlays */}
              {showToast && <div className="app-toast">{toastMessage}</div>}
              {showCelebration && (
                <div className="celebration">
                  <img src="/icons/success.svg" alt="success" style={{width:160,height:160}} />
                </div>
              )}
              {showSad && (
                <div className="sad-overlay">
                  <img src="/icons/failure.svg" alt="failure" style={{width:160,height:160}} />
                </div>
              )}
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
                data-nav-item={item}
                className={`nav-item ${activeSection === item ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection(item)
                  setSidebarOpen(false)
                }}
              >
                <span>{item === 'Overview' ? '▦' : item === 'Rooms' || item === 'My room' ? '⌂' : item === 'Payments' || item === 'Rent & payments' ? '₹' : item === 'Messages' ? '▢' : item === 'Complaints' ? '▤' : item === 'Calendar' ? '◫' : '♙'}</span>
                <span className="nav-text">{getNavLabel(item)}</span>
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
