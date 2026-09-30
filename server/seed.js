import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './models/User.js'
import Room from './models/Room.js'
import Payment from './models/Payment.js'
import Complaint from './models/Complaint.js'
const now=new Date(),month=now.toLocaleString('en-US',{month:'long',year:'numeric'}),dueDate=new Date(now.getFullYear(),now.getMonth(),5)
await mongoose.connect(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017/maish')
await Promise.all([User.deleteMany({}),Room.deleteMany({}),Payment.deleteMany({}),Complaint.deleteMany({})])
const [,rahul,priya,arjun,sneha]=await User.create([{name:'Aarav Mehta',email:'manishadmin@gmail.com',password:await bcrypt.hash('manish123',12),role:'admin'},{name:'Rahul Sharma',email:'rahul@email.com',password:await bcrypt.hash('manish123',12),role:'tenant'},{name:'Priya Patel',email:'priya@email.com',password:await bcrypt.hash('manish123',12),role:'tenant'},{name:'Arjun Kumar',email:'arjun@email.com',password:await bcrypt.hash('manish123',12),role:'tenant'},{name:'Sneha Das',email:'sneha@email.com',password:await bcrypt.hash('manish123',12),role:'tenant'}])
const rooms=await Room.create([{number:'102',rent:3000,type:'Deluxe single',bathroom:true,wifi:true,bed:true,fan:true,facilities:['WiFi','Attached bath','Fan','Bed'],tenant:rahul._id,status:'Occupied'},{number:'103',rent:2500,type:'Standard single',washBasin:true,wifi:true,bed:true,fan:true,facilities:['WiFi','Wash basin','Fan','Bed'],status:'Available'},{number:'201',rent:4500,type:'Deluxe double',bathroom:true,wifi:true,bed:true,ac:true,facilities:['WiFi','Attached bath','AC','Bed'],tenant:priya._id,status:'Occupied'},{number:'204',rent:3000,type:'Standard single',washBasin:true,wifi:true,bed:true,fan:true,facilities:['WiFi','Wash basin','Fan','Bed'],tenant:arjun._id,status:'Occupied'},{number:'301',rent:3500,type:'Deluxe single',bathroom:true,wifi:true,bed:true,fan:true,facilities:['WiFi','Attached bath','Fan','Bed'],tenant:sneha._id,status:'Occupied'},{number:'202',rent:2800,type:'Standard single',washBasin:true,bed:true,fan:true,status:'Maintenance'}])
for(const [u,r]of[[rahul,rooms[0]],[priya,rooms[2]],[arjun,rooms[3]],[sneha,rooms[4]]]){u.room=r._id;await u.save()}
await Payment.create([{tenant:rahul._id,room:rooms[0]._id,month,amount:3000,dueDate,status:'Pending'},{tenant:priya._id,room:rooms[2]._id,month,amount:4500,dueDate,status:'Paid',paymentDate:new Date(),method:'UPI',receiptNumber:'MAI-DEMO-001'},{tenant:arjun._id,room:rooms[3]._id,month,amount:3000,dueDate:new Date(now.getFullYear(),now.getMonth(),1),status:'Overdue'},{tenant:sneha._id,room:rooms[4]._id,month,amount:3500,dueDate,paymentDate:new Date(),status:'Paid',method:'Bank transfer',receiptNumber:'MAI-DEMO-002'}])
await Complaint.create([{tenant:rahul._id,room:rooms[0]._id,title:'Bathroom tap is leaking',category:'Bathroom',description:'Tap has been dripping since yesterday.',status:'In progress'},{tenant:priya._id,room:rooms[2]._id,title:'Light in corridor not working',category:'Electricity',status:'Open'}])
console.log('Demo data created. Admin: manishadmin@gmail.com / manish123. Tenants: rahul@email.com / manish123');await mongoose.disconnect()
