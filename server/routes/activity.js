import {Router} from 'express'
import ActivityLog from '../models/ActivityLog.js'
import {protect,allowRoles} from '../middleware/auth.js'
const router=Router();router.use(protect,allowRoles('admin'))
router.get('/',async(req,res,next)=>{try{res.json({activity:await ActivityLog.find().populate('actor','name').sort({createdAt:-1}).limit(100)})}catch(e){next(e)}})
export default router
