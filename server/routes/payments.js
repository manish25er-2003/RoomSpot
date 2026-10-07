import {Router} from 'express'
import Payment from '../models/Payment.js'
import Room from '../models/Room.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import ActivityLog from '../models/ActivityLog.js'
import {protect,allowRoles} from '../middleware/auth.js'
import { ensureCurrentMonthPaymentsForActiveTenants, getMonthKey } from '../utils/monthlyPayments.js'
const router=Router();router.use(protect)
router.get('/',async(req,res,next)=>{try{await ensureCurrentMonthPaymentsForActiveTenants(getMonthKey());const q=req.user.role==='tenant'?{tenant:req.user._id}:{};await Payment.updateMany({...q,status:'Pending',dueDate:{$lt:new Date(new Date().setHours(0,0,0,0))}},{status:'Overdue'});res.json({payments:await Payment.find(q).populate('tenant','name email').populate('room','number').sort({createdAt:-1})})}catch(e){next(e)}})
router.post('/',allowRoles('admin'),async(req,res,next)=>{try{const tenant=req.body.tenant?await User.findOne({name:req.body.tenant,role:'tenant'}):await User.findById(req.body.tenantId);if(!tenant)return res.status(404).json({message:'Tenant not found'});const room=tenant.room?await Room.findById(tenant.room):null;const payment=await Payment.create({tenant:tenant._id,room:room?._id,type:req.body.type||'Room Rent',month:req.body.month,amount:req.body.amount,dueDate:req.body.dueDate||new Date(),paymentDate:req.body.paymentDate||new Date(),method:req.body.method||'UPI',transactionId:req.body.transactionId,transactionDetails:req.body.transactionDetails,status:req.body.status||'Paid',receiptNumber:`MAI-${Date.now()}`});await Notification.create({user:tenant._id,title:'Rent payment recorded',detail:`${payment.month} · ₹${payment.amount.toLocaleString('en-IN')}`});await ActivityLog.create({actor:req.user._id,action:`Recorded rent payment for ${tenant.name}`,entityType:'Payment',entityId:payment._id});res.status(201).json({payment:await payment.populate('tenant','name')})}catch(e){next(e)}})
router.post('/:id/pay',allowRoles('tenant'),async(req,res,next)=>{try{const payment=await Payment.findOne({_id:req.params.id,tenant:req.user._id});if(!payment)return res.status(404).json({message:'Payment not found'});if(payment.status==='Paid')return res.status(409).json({message:'This payment is already paid'});payment.status='Paid';payment.method=req.body.method||'UPI';payment.paymentDate=new Date();payment.transactionId=req.body.transactionId||`UPI-${Date.now()}`;payment.transactionDetails=req.body.transactionDetails||{recordedAt:payment.paymentDate,source:'tenant payment confirmation'};payment.receiptNumber=`MAI-${Date.now()}`;await payment.save();await Notification.create({user:req.user._id,title:'Rent payment successful',detail:`${payment.month} · ₹${payment.amount.toLocaleString('en-IN')}`});res.json({payment})}catch(e){next(e)}})
router.post('/:id/pay', allowRoles('tenant'), async (req, res, next) => {
	try {
		const payment = await Payment.findOne({ _id: req.params.id, tenant: req.user._id })
		if (!payment) return res.status(404).json({ message: 'Payment not found' })
		if (payment.status === 'Paid') return res.status(409).json({ message: 'This payment is already paid' })

		// mark paid
		payment.status = 'Paid'
		payment.method = req.body.method || 'UPI'
		payment.paymentDate = new Date()
		payment.transactionId = req.body.transactionId || `UPI-${Date.now()}`
		payment.transactionDetails = req.body.transactionDetails || { recordedAt: payment.paymentDate, source: 'tenant payment confirmation' }
		payment.receiptNumber = `MAI-${Date.now()}`
		await payment.save()

		await Notification.create({ user: req.user._id, title: 'Rent payment successful', detail: `${payment.month} · ₹${payment.amount.toLocaleString('en-IN')}` })

		// emit socket event so admin and tenant clients can see update instantly
		try {
			const io = req.app.get('io')
			if (io) {
				// emit to tenant and admin channels
				io.to(String(payment.tenant)).emit('payment:updated', { payment })
				io.emit('payment:updated:admin', { payment })
			}
		} catch (err) {
			console.error('Socket emit failed', err.message)
		}

		res.json({ payment })
	} catch (e) {
		next(e)
	}
})
router.patch('/:id',allowRoles('admin'),async(req,res,next)=>{try{const payment=await Payment.findById(req.params.id);if(!payment)return res.status(404).json({message:'Payment not found'});if(req.body.status)payment.status=req.body.status;if(req.body.method!==undefined)payment.method=req.body.method;if(req.body.transactionId!==undefined)payment.transactionId=req.body.transactionId;if(req.body.transactionDetails!==undefined)payment.transactionDetails=req.body.transactionDetails;if(payment.status==='Paid'){payment.paymentDate=req.body.paymentDate||payment.paymentDate||new Date();if(!payment.transactionId)payment.transactionId=`ADMIN-${Date.now()}`;if(!payment.transactionDetails)payment.transactionDetails={recordedAt:payment.paymentDate,source:'admin payment confirmation'};if(!payment.receiptNumber)payment.receiptNumber=`MAI-${Date.now()}`}await payment.save();res.json({payment})}catch(e){next(e)}})
router.get('/:id/receipt',async(req,res,next)=>{try{const payment=await Payment.findById(req.params.id).populate('tenant','name email').populate('room','number');if(!payment)return res.status(404).json({message:'Payment not found'});if(req.user.role==='tenant'&&String(payment.tenant._id)!==String(req.user._id))return res.status(403).json({message:'Not your receipt'});res.json({receipt:{receiptNumber:payment.receiptNumber||`MAI-${payment._id}`,tenant:payment.tenant.name,email:payment.tenant.email,room:payment.room?.number,month:payment.month,type:payment.type,amount:payment.amount,status:payment.status,method:payment.method,transactionId:payment.transactionId,transactionDetails:payment.transactionDetails,paymentDate:payment.paymentDate,dueDate:payment.dueDate}})}catch(e){next(e)}})
export default router
