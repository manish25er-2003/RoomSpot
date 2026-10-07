import { Router } from 'express'
import Complaint from '../models/Complaint.js'
import User from '../models/User.js'
import Room from '../models/Room.js'
import Notification from '../models/Notification.js'
import ActivityLog from '../models/ActivityLog.js'
import Message from '../models/Message.js'
import { protect, allowRoles } from '../middleware/auth.js'

const router = Router()
router.use(protect)

const generateIssueId = async () => {
  let issueId = `ISS-${Date.now().toString().slice(-6)}`
  let tries = 0
  while (tries < 10) {
    const existing = await Complaint.findOne({ issueId })
    if (!existing) return issueId
    issueId = `ISS-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    tries += 1
  }
  return `ISS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

const generateMessageId = async () => {
  let messageId = `MSG-${Date.now().toString().slice(-8)}`
  let tries = 0
  while (tries < 10) {
    const existing = await Message.findOne({ messageId })
    if (!existing) return messageId
    messageId = `MSG-${Date.now().toString().slice(-8)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    tries += 1
  }
  return `MSG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

router.get('/', async (req, res, next) => {
  try {
    const query = req.user.role === 'tenant' ? { tenant: req.user._id } : {}
    const complaints = await Complaint.find(query)
      .populate('tenant', 'name email')
      .populate('room', 'number')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
    res.json({ complaints })
  } catch (e) { next(e) }
})

router.get('/my', async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ tenant: req.user._id })
      .populate('tenant', 'name email')
      .populate('room', 'number')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
    res.json({ complaints })
  } catch (e) { next(e) }
})

router.get('/stats', allowRoles('admin'), async (req, res, next) => {
  try {
    const total = await Complaint.countDocuments()
    const open = await Complaint.countDocuments({ status: 'Open' })
    const inReview = await Complaint.countDocuments({ status: 'In Review' })
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' })
    const resolved = await Complaint.countDocuments({ status: 'Resolved' })
    const closed = await Complaint.countDocuments({ status: 'Closed' })
    res.json({ stats: { total, open, inReview, inProgress, resolved, closed } })
  } catch (e) { next(e) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('tenant', 'name email')
      .populate('room', 'number')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')

    if (!complaint) return res.status(404).json({ message: 'Issue not found' })
    if (req.user.role === 'tenant' && String(complaint.tenant._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You do not have access to this issue' })
    }

    const issueMessages = await Message.find({ issueId: complaint.issueId }).populate('sender', 'name role').populate('recipient', 'name role').sort({ createdAt: 1 })
    res.json({ complaint, messages: issueMessages })
  } catch (e) { next(e) }
})

router.post('/', allowRoles('tenant'), async (req, res, next) => {
  try {
    const { title, description, category, priority, roomNumber, attachment } = req.body
    if (!title?.trim()) return res.status(400).json({ message: 'Issue title is required' })
    if (!description?.trim()) return res.status(400).json({ message: 'Description is required' })

    const room = await Room.findOne({ tenant: req.user._id })
    const issueId = await generateIssueId()

    const complaint = await Complaint.create({
      issueId,
      tenant: req.user._id,
      room: room?._id || null,
      roomNumber: roomNumber || room?.number || 'N/A',
      title: title.trim(),
      category: category || 'Maintenance',
      priority: priority || 'Medium',
      description: description.trim(),
      attachments: attachment ? [attachment] : [],
      status: 'Open',
      adminResponse: ''
    })

    const admin = await User.findOne({ role: 'admin' })
    if (admin) {
      await Notification.create({
        user: admin._id,
        title: 'New issue reported',
        type: 'issue',
        detail: `${req.user.name} · ${complaint.title} · Room ${complaint.roomNumber || 'N/A'} · Priority: ${complaint.priority}`
      })
    }

    await ActivityLog.create({
      actor: req.user._id,
      action: `Submitted issue ${issueId}`,
      entityType: 'Complaint',
      entityId: complaint._id
    })

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('tenant', 'name email')
      .populate('room', 'number')

    res.status(201).json({ complaint: populatedComplaint })
  } catch (e) { next(e) }
})

router.patch('/:id', allowRoles('admin'), async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
    if (!complaint) return res.status(404).json({ message: 'Issue not found' })

    if (req.body.status) complaint.status = req.body.status
    if (req.body.priority) complaint.priority = req.body.priority
    if (req.body.adminResponse !== undefined) complaint.adminResponse = req.body.adminResponse
    if (req.body.assignedTo) complaint.assignedTo = req.body.assignedTo

    if (req.body.status === 'Resolved') {
      complaint.resolvedAt = new Date()
      complaint.resolvedBy = req.user._id
    }

    await complaint.save()

    if (complaint.tenant) {
      await Notification.create({
        user: complaint.tenant,
        title: complaint.status === 'Resolved' ? 'Your issue has been resolved.' : 'Issue updated',
        type: 'issue',
        detail: `${complaint.title} is now ${complaint.status}`
      })
    }

    await ActivityLog.create({
      actor: req.user._id,
      action: `Updated issue ${complaint.issueId} to ${complaint.status}`,
      entityType: 'Complaint',
      entityId: complaint._id
    })

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('tenant', 'name email')
      .populate('room', 'number')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')

    res.json({ complaint: populatedComplaint })
  } catch (e) { next(e) }
})

router.patch('/:id/resolve', allowRoles('admin'), async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
    if (!complaint) return res.status(404).json({ message: 'Issue not found' })

    complaint.status = 'Resolved'
    complaint.resolvedAt = new Date()
    complaint.resolvedBy = req.user._id
    complaint.adminResponse = req.body.adminResponse || req.body.resolution || complaint.adminResponse || 'Issue resolved.'
    await complaint.save()

    await Notification.create({
      user: complaint.tenant,
      title: 'Your issue has been resolved.',
      type: 'issue',
      detail: `${complaint.title} was resolved by the admin.`
    })

    await ActivityLog.create({
      actor: req.user._id,
      action: `Resolved issue ${complaint.issueId}`,
      entityType: 'Complaint',
      entityId: complaint._id
    })

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('tenant', 'name email')
      .populate('room', 'number')
      .populate('resolvedBy', 'name email')

    res.json({ complaint: populatedComplaint })
  } catch (e) { next(e) }
})

router.post('/:id/messages', async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
    if (!complaint) return res.status(404).json({ message: 'Issue not found' })

    if (req.user.role === 'tenant' && String(complaint.tenant) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You cannot message this issue' })
    }

    const body = req.body.message?.trim()
    if (!body) return res.status(400).json({ message: 'Message is required' })

    const recipient = req.user.role === 'tenant' ? await User.findOne({ role: 'admin' }) : complaint.tenant
    const messageId = await generateMessageId()
    const message = await Message.create({
      messageId,
      issueId: complaint.issueId,
      sender: req.user._id,
      recipient: recipient?._id || null,
      body
    })

    if (recipient) {
      await Notification.create({
        user: recipient._id,
        title: req.user.role === 'tenant' ? 'New message' : 'Issue reply',
        type: 'message',
        detail: `${req.user.name} sent a message regarding ${complaint.title}`
      })
    }

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name role').populate('recipient', 'name role')
    res.status(201).json({ message: populatedMessage })
  } catch (e) { next(e) }
})

router.get('/:id/messages', async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
    if (!complaint) return res.status(404).json({ message: 'Issue not found' })
    if (req.user.role === 'tenant' && String(complaint.tenant) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You cannot access this issue conversation' })
    }

    const messages = await Message.find({ issueId: complaint.issueId }).populate('sender', 'name role').populate('recipient', 'name role').sort({ createdAt: 1 })
    res.json({ messages })
  } catch (e) { next(e) }
})

router.patch('/messages/:id/read', async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id)
    if (!message) return res.status(404).json({ message: 'Message not found' })
    if (String(message.recipient) !== String(req.user._id) && String(message.sender) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You cannot update this message' })
    }
    message.readAt = new Date()
    await message.save()
    res.json({ message })
  } catch (e) { next(e) }
})

export default router
