import mongoose from 'mongoose'
const complaintSchema=new mongoose.Schema({ tenant:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}, room:{type:mongoose.Schema.Types.ObjectId,ref:'Room'}, title:{type:String,required:true}, category:{type:String,enum:['Water','Electricity','Bathroom','Cleaning','Maintenance','Other','Plumbing'],default:'Maintenance'}, description:String, status:{type:String,enum:['Open','In progress','Resolved'],default:'Open'}, resolvedAt:Date },{timestamps:true})
export default mongoose.model('Complaint',complaintSchema)
