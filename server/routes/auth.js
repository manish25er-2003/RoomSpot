import {Router} from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import {protect} from '../middleware/auth.js'
const router=Router()
const tokenFor=user=>jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:'7d'})
const safe=user=>({id:user._id,name:user.name,email:user.email,role:user.role,phone:user.phone,room:user.room})
router.post('/register',async(req,res,next)=>{try{const{name,email,password,phone}=req.body;if(!name||!email||!password||password.length<6)return res.status(400).json({message:'Name, email and a password of at least 6 characters are required'});if(await User.exists({email:email.toLowerCase()}))return res.status(409).json({message:'An account with this email already exists'});const user=await User.create({name,email,password:await bcrypt.hash(password,12),phone,role:'tenant'});res.status(201).json({token:tokenFor(user),user:safe(user)})}catch(e){next(e)}})
router.post('/login',async(req,res,next)=>{try{const{email,password}=req.body;const user=await User.findOne({email:email?.toLowerCase()}).select('+password').populate('room');if(!user||!await bcrypt.compare(password||'',user.password))return res.status(401).json({message:'Email or password is incorrect'});res.json({token:tokenFor(user),user:safe(user)})}catch(e){next(e)}})
router.get('/me',protect,async(req,res)=>res.json({user:safe(await req.user.populate('room'))}))
export default router
