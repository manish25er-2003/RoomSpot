import { Router } from 'express'
import Room from '../models/Room.js'
import User from '../models/User.js'
import Payment from '../models/Payment.js'
import ActivityLog from '../models/ActivityLog.js'
import Notification from '../models/Notification.js'
import { protect, allowRoles } from '../middleware/auth.js'
import { ensureMonthlyPaymentRecordsForTenant, getMonthKey } from '../utils/monthlyPayments.js'

const router = Router()
router.use(protect)

router.get('/', async (req, res, next) => {
  try {
    const q = req.user.role === 'tenant' ? { tenant: req.user._id } : {}
    const rooms = await Room.find(q).populate('tenant', 'name email')
    res.json({ rooms })
  } catch (err) {
    next(err)
  }
})

router.post('/', allowRoles('admin'), async (req, res, next) => {
  try {
    const room = await Room.create(req.body)
    await ActivityLog.create({ actor: req.user._id, action: `Added room ${room.number}`, entityType: 'Room', entityId: room._id })
    res.status(201).json({ room })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', allowRoles('admin'), async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!room) return res.status(404).json({ message: 'Room not found' })
    res.json({ room })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', allowRoles('admin'), async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
    if (!room) return res.status(404).json({ message: 'Room not found' })
    if (room.tenant) return res.status(409).json({ message: 'Vacate this room before deleting it' })
    await room.deleteOne()
    res.json({ message: 'Room deleted' })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/assign', allowRoles('admin'), async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
    if (!room) return res.status(404).json({ message: 'Room not found' })
    if (room.status === 'Maintenance') return res.status(409).json({ message: 'A room under maintenance cannot be assigned' })

    const tenant = req.body.tenantId ? await User.findById(req.body.tenantId) : await User.findOne({ name: req.body.tenantName, role: 'tenant' })
    if (!tenant) return res.status(404).json({ message: 'Tenant not found. Add the tenant account first.' })
    if (tenant.room && String(tenant.room) !== String(room._id)) return res.status(409).json({ message: 'Tenant already has an assigned room' })
    if (room.tenant && String(room.tenant) !== String(tenant._id)) return res.status(409).json({ message: 'Room is already occupied' })

    const isNewAssignment = !tenant.room || String(tenant.room) !== String(room._id)
    room.tenant = tenant._id
    if (req.body.rent != null) room.rent = req.body.rent
    room.status = 'Occupied'
    await room.save()

    tenant.room = room._id
    if (isNewAssignment || !tenant.rentStartDate) tenant.rentStartDate = req.body.rentStartDate ? new Date(req.body.rentStartDate) : new Date()
    await tenant.save()

    const paymentRecords = await ensureMonthlyPaymentRecordsForTenant({ tenantId: tenant._id, roomId: room._id, monthKey: getMonthKey(new Date()) })

    const populatedRoom = await room.populate('tenant', 'name email')
    await Notification.create({ user: tenant._id, title: 'Room assigned', detail: `You have been assigned room ${room.number}` })
    await ActivityLog.create({ actor: req.user._id, action: `Assigned ${tenant.name} to room ${room.number}`, entityType: 'Room', entityId: room._id })

    try {
      const io = req.app.get('io')
      if (io) {
        io.to(String(tenant._id)).emit('room:assigned', { room: populatedRoom, tenantId: tenant._id, payments: paymentRecords })
        io.emit('room:assigned:admin', { room: populatedRoom, tenantId: tenant._id, payments: paymentRecords })
      }
    } catch (err) {
      console.error('Socket emit failed', err.message)
    }

    res.json({ room: populatedRoom })
  } catch (e) {
    next(e)
  }
})

router.patch('/:id/vacate', allowRoles('admin'), async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
    if (!room) return res.status(404).json({ message: 'Room not found' })
    if (room.tenant) {
      const tenant = await User.findById(room.tenant)
      if (tenant) {
        tenant.room = null
        tenant.rentStartDate = null
        await tenant.save()
      }
    }
    room.tenant = null
    room.status = 'Available'
    await room.save()
    res.json({ room })
  } catch (e) {
    next(e)
  }
})

export default router
