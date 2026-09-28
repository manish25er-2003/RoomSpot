import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './models/User.js'
import authRoutes from './routes/auth.js'
import roomRoutes from './routes/rooms.js'
import userRoutes from './routes/users.js'
import paymentRoutes from './routes/payments.js'
import complaintRoutes from './routes/complaints.js'
import messageRoutes from './routes/messages.js'
import notificationRoutes from './routes/notifications.js'
import activityRoutes from './routes/activity.js'
const app=express()
app.use(cors({origin:process.env.CLIENT_URL||'http://localhost:5173'}));app.use(express.json({limit:'1mb'}))
app.get('/api/health',(req,res)=>res.json({status:'ok',service:'Maish API'}))
app.use('/api/auth',authRoutes);app.use('/api/rooms',roomRoutes);app.use('/api/users',userRoutes);app.use('/api/payments',paymentRoutes);app.use('/api/complaints',complaintRoutes);app.use('/api/messages',messageRoutes);app.use('/api/notifications',notificationRoutes);app.use('/api/activity',activityRoutes)
app.use((req,res)=>res.status(404).json({message:'Route not found'}))
app.use((err,req,res,_next)=>{console.error(err);if(err.code===11000)return res.status(409).json({message:'A record with this value already exists'});if(err.name==='ValidationError')return res.status(400).json({message:err.message});res.status(500).json({message:process.env.NODE_ENV==='production'?'Server error':err.message})})
const port=process.env.PORT||5000
try{await mongoose.connect(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017/maish');console.log('MongoDB connected');if(process.env.ADMIN_EMAIL&&process.env.ADMIN_PASSWORD){const exists=await User.findOne({email:process.env.ADMIN_EMAIL.toLowerCase()});if(!exists){await User.create({name:'Maish Administrator',email:process.env.ADMIN_EMAIL,password:await bcrypt.hash(process.env.ADMIN_PASSWORD,12),role:'admin'});console.log(`Admin account created: ${process.env.ADMIN_EMAIL}`)}}app.listen(port,()=>console.log(`Maish API running on http://localhost:${port}`))}catch(err){console.error('Could not connect to MongoDB:',err.message);process.exit(1)}
