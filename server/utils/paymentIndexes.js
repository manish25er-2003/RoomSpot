import Payment from '../models/Payment.js'

const monthlyIndexKeys = ['tenant', 'room', 'type', 'month']

export async function preparePaymentIndexes() {
  // Treat existing single monthly payments as room rent before widening the index.
  await Payment.collection.updateMany(
    { type: { $exists: false } },
    { $set: { type: 'Room Rent' } },
  )

  const indexes = await Payment.collection.indexes()
  const obsoleteIndex = indexes.find((index) => {
    if (!index.unique) return false
    const keys = Object.keys(index.key)
    return keys.length === 2 && keys.includes('tenant') && keys.includes('month')
  })

  if (obsoleteIndex) {
    await Payment.collection.dropIndex(obsoleteIndex.name)
  }

  await Payment.collection.createIndex(
    { tenant: 1, room: 1, type: 1, month: 1 },
    { unique: true, name: 'unique_monthly_tenant_room_type' },
  )
}
