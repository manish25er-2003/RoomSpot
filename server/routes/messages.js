import {Router} from 'express'
import Message from '../models/Message.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import {protect} from '../middleware/auth.js'
const router=Router();router.use(protect)
router.get('/',async(req,res,next)=>{try{const admins=await User.find({role:'admin'}).select('_id');const peers=req.user.role==='admin'?await User.find({role:'tenant'}).select('_id'):[...admins];const ids=peers.map(x=>x._id);const messages=await Message.find({$or:[{sender:req.user._id,recipient:{$in:ids}},{sender:{$in:ids},recipient:req.user._id},{sender:req.user._id,recipient:null}]}).populate('sender','name role').sort({createdAt:1}).limit(300);res.json({messages})}catch(e){next(e)}})
router.post('/',async(req,res,next)=>{try{if(!req.body.body?.trim())return res.status(400).json({message:'Message cannot be empty'});let recipient;if(req.user.role==='tenant')recipient=await User.findOne({role:'admin'});else recipient=req.body.recipient?await User.findById(req.body.recipient):null;const message=await Message.create({sender:req.user._id,recipient:recipient?._id,body:req.body.body.trim()});if(recipient)await Notification.create({user:recipient._id,title:'New message',detail:`${req.user.name} sent you a message`});res.status(201).json({message:await message.populate('sender','name role')})}catch(e){next(e)}})
export default router
