import jwt from 'jsonwebtoken'
import User from '../models/User.js'
const JWT_SECRET = process.env.JWT_SECRET || 'roomspot-dev-secret'
export async function protect(req,res,next){ try{const header=req.headers.authorization||'';const token=header.startsWith('Bearer ')?header.slice(7):null;if(!token)return res.status(401).json({message:'Authentication required'});const payload=jwt.verify(token,JWT_SECRET);req.user=await User.findById(payload.id);if(!req.user||!req.user.isActive)return res.status(401).json({message:'Account not available'});next()}catch{return res.status(401).json({message:'Invalid or expired token'})} }
export function allowRoles(...roles){return(req,res,next)=>roles.includes(req.user.role)?next():res.status(403).json({message:'You do not have permission to do that'})}
