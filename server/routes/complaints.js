import {Router} from 'express'
import Complaint from '../models/Complaint.js'
import User from '../models/User.js'
import Room from '../models/Room.js'
import Notification from '../models/Notification.js'
import ActivityLog from '../models/ActivityLog.js'
import {protect,allowRoles} from '../middleware/auth.js'
const router=Router();router.use(protect)
router.get('/',async(req,res,next)=>{try{const q=req.user.role==='tenant'?{tenant:req.user._id}:{};res.json({complaints:await Complaint.find(q).populate('tenant','name email').populate('room','number').sort({createdAt:-1})})}catch(e){next(e)}})
router.post('/',allowRoles('tenant'),async(req,res,next)=>{try{const room=await Room.findOne({tenant:req.user._id});const complaint=await Complaint.create({tenant:req.user._id,room:room?._id,title:req.body.title,category:req.body.category,description:req.body.description});const admin=await User.findOne({role:'admin'});if(admin)await Notification.create({user:admin._id,title:'New maintenance request',detail:`${req.user.name} · ${room?`Room ${room.number}`:'No room assigned'}`});await ActivityLog.create({actor:req.user._id,action:`Submitted a ${complaint.category} complaint`,entityType:'Complaint',entityId:complaint._id});res.status(201).json({complaint:await complaint.populate([{path:'tenant',select:'name'},{path:'room',select:'number'}])})}catch(e){next(e)}})
router.patch('/:id',allowRoles('admin'),async(req,res,next)=>{try{const complaint=await Complaint.findById(req.params.id);if(!complaint)return res.status(404).json({message:'Complaint not found'});if(req.body.status)complaint.status=req.body.status;if(complaint.status==='Resolved')complaint.resolvedAt=new Date();await complaint.save();await Notification.create({user:complaint.tenant,title:'Complaint updated',detail:`Your request “${complaint.title}” is ${complaint.status.toLowerCase()}`});await ActivityLog.create({actor:req.user._id,action:`Updated complaint status to ${complaint.status}`,entityType:'Complaint',entityId:complaint._id});res.json({complaint})}catch(e){next(e)}})
export default router
