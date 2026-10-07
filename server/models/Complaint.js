import mongoose from 'mongoose'

const complaintSchema = new mongoose.Schema({
  issueId: { type: String, required: true, unique: true, trim: true },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  roomNumber: { type: String, default: 'N/A' },
  title: { type: String, required: true, trim: true },
  category: { type: String, enum: ['Water', 'Electricity', 'Bathroom', 'Cleaning', 'Maintenance', 'Other', 'Plumbing'], default: 'Maintenance' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Open', 'In Review', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  attachments: [{ type: String }],
  adminResponse: { type: String, default: '' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  conversation: [{
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true })

export default mongoose.model('Complaint', complaintSchema)
