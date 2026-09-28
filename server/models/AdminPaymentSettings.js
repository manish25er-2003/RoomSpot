import mongoose from 'mongoose'

const adminPaymentSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    enum: ['adminUpiId'],
  },
  value: {
    type: String,
    required: true,
    trim: true,
    default: '7087338600@ybl',
  },
}, { timestamps: true })

export default mongoose.model('AdminPaymentSettings', adminPaymentSettingsSchema)
