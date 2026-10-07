import 'dotenv/config'
import express from 'express'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './models/User.js'
import AdminPaymentSettings from './models/AdminPaymentSettings.js'
import authRoutes from './routes/auth.js'
import roomRoutes from './routes/rooms.js'
import userRoutes from './routes/users.js'
import paymentRoutes from './routes/payments.js'
import complaintRoutes from './routes/complaints.js'
import messageRoutes from './routes/messages.js'
import notificationRoutes from './routes/notifications.js'
import activityRoutes from './routes/activity.js'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import settingsRoutes from './routes/settings.js'
import {preparePaymentIndexes} from './utils/paymentIndexes.js'
import { ensureCurrentMonthPaymentsForActiveTenants } from './utils/monthlyPayments.js'
const app=express()
const httpServer = createServer(app)
let io = null
const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS || '').split(',').map((origin) => origin.trim()).filter(Boolean),
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',

].filter(Boolean)

const isAllowedOrigin = (origin) => {
  if (!origin) return true

  const normalizedOrigin = origin.trim().replace(/\/$/, '')
  if (allowedOrigins.includes(normalizedOrigin)) return true

  const localDevOriginPattern = /^(https?:\/\/)(localhost|127\.0\.0\.1|(?:\d{1,3}\.){3}\d{1,3})(?::\d+)?$/i
  const cloudflareOriginPattern = /^(https?:\/\/)([a-z0-9-]+\.)*workers\.dev$/i

  if (localDevOriginPattern.test(normalizedOrigin) || cloudflareOriginPattern.test(normalizedOrigin)) {
    return true
  }

  return false
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('CORS origin not allowed'))
  },
  credentials: true,
}))
app.use(express.json({limit:'1mb'}))
// serve uploaded files
import path from 'path'
const uploadsDir = path.join(process.cwd(), 'uploads')
app.use('/uploads', express.static(uploadsDir))
app.get('/api/health',(req,res)=>res.json({status:'ok',service:'Maish API'}))
app.use('/api/auth',authRoutes);app.use('/api/rooms',roomRoutes);app.use('/api/users',userRoutes);app.use('/api/payments',paymentRoutes);app.use('/api/complaints',complaintRoutes);app.use('/api/messages',messageRoutes);app.use('/api/notifications',notificationRoutes);app.use('/api/activity',activityRoutes);app.use('/api/settings',settingsRoutes)
app.use((req,res)=>res.status(404).json({message:'Route not found'}))
app.use((err,req,res,_next)=>{console.error(err);if(err.code===11000)return res.status(409).json({message:'A record with this value already exists'});if(err.name==='ValidationError')return res.status(400).json({message:err.message});res.status(500).json({message:process.env.NODE_ENV==='production'?'Server error':err.message})})
const port = Number(process.env.PORT) || 5000

try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/maish')
  await preparePaymentIndexes()
  console.log('MongoDB connected')
  await ensureCurrentMonthPaymentsForActiveTenants()

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const exists = await User.findOne({ email: process.env.ADMIN_EMAIL.toLowerCase() })
    if (!exists) {
      await User.create({
        name: 'Maish Administrator',
        email: process.env.ADMIN_EMAIL,
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
        role: 'admin',
      })
      console.log(`Admin account created: ${process.env.ADMIN_EMAIL}`)
    }
  }

  const defaultAdminUpi = '7087338600@ybl'
  await AdminPaymentSettings.findOneAndUpdate(
    { key: 'adminUpiId' },
    { $set: { value: defaultAdminUpi } },
    { upsert: true, new: true }
  )
  console.log(`Admin UPI stored: ${defaultAdminUpi}`)

  setInterval(() => {
    ensureCurrentMonthPaymentsForActiveTenants().catch((error) => console.error('Monthly payment sync failed:', error.message))
  }, 60 * 60 * 1000)

  // start socket.io
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    console.log('Socket connected', socket.id)

    // clients should emit 'identify' with their JWT token to join their personal room
    socket.on('identify', (token) => {
      try {
        if (!token) return
          const decoded = token && jwt.verify(token, process.env.JWT_SECRET)
          if (decoded?.id) {
            socket.join(decoded.id)
          }
      } catch (err) {
        // ignore invalid tokens
      }
    })

    socket.on('disconnect', () => console.log('Socket disconnected', socket.id))
  })

  app.set('io', io)

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Maish API running on http://0.0.0.0:${port}`)
  })
} catch (err) {
  console.error('Could not connect to MongoDB:', err.message)
  process.exit(1)
}
