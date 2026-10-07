import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  messageId: { type: String, required: true, unique: true, trim: true },
  issueId: { type: String, default: null, trim: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  body: { type: String, required: true, trim: true },
  readAt: Date,
}, { timestamps: true })

export default mongoose.model('Message', messageSchema)
