import mongoose from 'mongoose'
const paymentSchema=new mongoose.Schema({ tenant:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}, room:{type:mongoose.Schema.Types.ObjectId,ref:'Room'}, month:{type:String,required:true}, amount:{type:Number,required:true,min:0}, dueDate:{type:Date,required:true}, paymentDate:Date, method:{type:String,enum:['UPI','Cash','Bank transfer','Card','Other',''],default:''}, status:{type:String,enum:['Paid','Pending','Overdue'],default:'Pending'}, receiptNumber:String },{timestamps:true})
paymentSchema.index({tenant:1,month:1},{unique:true})
export default mongoose.model('Payment',paymentSchema)
