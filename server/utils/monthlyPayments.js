import Payment from '../models/Payment.js'
import User from '../models/User.js'

export const getMonthKey = (date = new Date()) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)

const paymentTemplates = [
  {
    type: 'Room Rent',
    amount: (room) => Number(room?.rent || 0),
  },
  {
    type: 'Electricity Bill',
    amount: (room) => Math.max(250, Number(room?.rent || 0) * 0.12),
  },
  {
    type: 'Water Bill',
    amount: () => 300,
  },
  {
    type: 'Security Charge',
    amount: (room) => Math.max(300, Number(room?.rent || 0) * 0.05),
  },
]

export async function ensureMonthlyPaymentRecordsForTenant({ tenantId, roomId, monthKey = getMonthKey() }) {
  if (!tenantId || !roomId) return []

  const tenant = await User.findById(tenantId).populate('room', 'number rent')
  const room = tenant?.room || (await User.findById(tenantId).populate('room', 'number rent'))?.room

  if (!tenant || !room) return []

  const records = []
  const month = monthKey || getMonthKey()

  for (const template of paymentTemplates) {
    const amount = Math.round(Number(template.amount(room) || 0))
    const dueDate = new Date(new Date().getFullYear(), new Date().getMonth(), 5)

    const record = await Payment.findOneAndUpdate(
      { tenant: tenant._id, room: room._id, type: template.type, month },
      {
        $setOnInsert: {
          tenant: tenant._id,
          room: room._id,
          type: template.type,
          month,
          amount,
          dueDate,
          status: 'Pending',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )

    records.push(record)
  }

  return records
}

export async function ensureCurrentMonthPaymentsForActiveTenants(monthKey = getMonthKey()) {
  const activeTenants = await User.find({ role: 'tenant', room: { $ne: null }, isActive: { $ne: false } }).populate('room', 'number rent')
  const results = []

  for (const tenant of activeTenants) {
    if (!tenant.room) continue
    const monthlyRecords = await ensureMonthlyPaymentRecordsForTenant({
      tenantId: tenant._id,
      roomId: tenant.room._id,
      monthKey,
    })
    results.push(...monthlyRecords)
  }

  return results
}
