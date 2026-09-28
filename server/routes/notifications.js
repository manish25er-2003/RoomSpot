import {Router} from 'express'
import Notification from '../models/Notification.js'
import {protect} from '../middleware/auth.js'
const router=Router();router.use(protect)
router.get('/',async(req,res,next)=>{try{const q=req.user.role==='admin'?{$or:[{user:req.user._id},{user:null}]}:{user:req.user._id};res.json({notifications:await Notification.find(q).sort({createdAt:-1}).limit(100)})}catch(e){next(e)}})
router.patch('/:id/read',async(req,res,next)=>{try{const n=await Notification.findOneAndUpdate({_id:req.params.id,$or:[{user:req.user._id},{user:null}]},{readAt:new Date()},{new:true});if(!n)return res.status(404).json({message:'Notification not found'});res.json({notification:n})}catch(e){next(e)}})
router.patch('/read-all',async(req,res,next)=>{try{await Notification.updateMany({user:req.user._id,readAt:null},{readAt:new Date()});res.json({message:'Notifications marked read'})}catch(e){next(e)}})
export default router
