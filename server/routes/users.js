import {Router} from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import Room from '../models/Room.js'
import ActivityLog from '../models/ActivityLog.js'
import {protect,allowRoles} from '../middleware/auth.js'

const router=Router()
router.get('/stays',protect,async(req,res,next)=>{try{const tenants=req.user.role==='admin'?await User.find({role:'tenant',room:{$ne:null}}).populate('room','number rent'):await User.find({_id:req.user._id,role:'tenant',room:{$ne:null}}).populate('room','number rent');const today=new Date();today.setHours(0,0,0,0);res.json({stays:tenants.filter(tenant=>tenant.room).map(tenant=>{const start=tenant.rentStartDate?new Date(tenant.rentStartDate):null;if(start)start.setHours(0,0,0,0);return{tenantId:tenant._id,tenantName:tenant.name,roomId:tenant.room._id,roomNumber:tenant.room.number,rentStartDate:tenant.rentStartDate||null,stayDays:start?Math.max(0,Math.floor((today-start)/86400000)):null}})})}catch(e){next(e)}})
router.use(protect,allowRoles('admin'))
router.get('/',async(req,res,next)=>{try{res.json({users:await User.find({role:'tenant'}).select('-password').populate('room')})}catch(e){next(e)}})
router.post('/',async(req,res,next)=>{try{const{name,email,password,phone}=req.body;if(!name||!email||!password||password.length<6)return res.status(400).json({message:'Name, email and a password of at least 6 characters are required'});const user=await User.create({name,email,password:await bcrypt.hash(password,12),phone,role:'tenant'});await ActivityLog.create({actor:req.user._id,action:`Added tenant ${name}`,entityType:'User',entityId:user._id});res.status(201).json({user:{id:user._id,name:user.name,email:user.email,phone:user.phone,role:user.role}})}catch(e){next(e)}})
router.patch('/:id',async(req,res,next)=>{try{const user=await User.findOneAndUpdate({_id:req.params.id,role:'tenant'},req.body,{new:true,runValidators:true}).select('-password');if(!user)return res.status(404).json({message:'Tenant not found'});res.json({user})}catch(e){next(e)}})
router.delete('/:id',async(req,res,next)=>{try{const user=await User.findOne({_id:req.params.id,role:'tenant'});if(!user)return res.status(404).json({message:'Tenant not found'});if(user.room){await Room.findByIdAndUpdate(user.room,{tenant:null,status:'Available'})}user.isActive=false;await user.save();res.json({message:'Tenant account deactivated'})}catch(e){next(e)}})
export default router
