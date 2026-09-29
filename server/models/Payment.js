import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  type: {
    type: String,
    enum: ['Room Rent', 'Electricity Bill', 'Water Bill', 'Security Charge'],
    default: 'Room Rent',
    required: true,
  },
  month: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  dueDate: { type: Date, required: true },
  paymentDate: Date,
  method: { type: String, enum: ['UPI', 'Cash', 'Bank transfer', 'Card', 'Other', ''], default: '' },
  transactionId: String,
  transactionDetails: mongoose.Schema.Types.Mixed,
  status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
  receiptNumber: String,
}, { timestamps: true })

paymentSchema.index(
  { tenant: 1, room: 1, type: 1, month: 1 },
  { unique: true, name: 'unique_monthly_tenant_room_type' },
)

export default mongoose.model('Payment', paymentSchema)
