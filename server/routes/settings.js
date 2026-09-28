import { Router } from 'express'
import AdminPaymentSettings from '../models/AdminPaymentSettings.js'
import { protect, allowRoles } from '../middleware/auth.js'

const router = Router()

router.get('/payment', async (req, res, next) => {
  try {
    const settings = await AdminPaymentSettings.findOne({ key: 'adminUpiId' })
    const value = settings?.value || '7087338600@ybl'
    res.json({ adminUpiId: value })
  } catch (error) {
    next(error)
  }
})

router.put('/payment', protect, allowRoles('admin'), async (req, res, next) => {
  try {
    const nextValue = req.body?.adminUpiId || req.body?.value || '7087338600@ybl'
    const settings = await AdminPaymentSettings.findOneAndUpdate(
      { key: 'adminUpiId' },
      { $set: { value: nextValue } },
      { upsert: true, new: true }
    )
    res.json({ adminUpiId: settings.value })
  } catch (error) {
    next(error)
  }
})

export default router
