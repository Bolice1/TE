import {Router} from 'express'
import { createReport } from '../controllers/reportController.js'
import { isAregisteredTeacher } from '../middlewares/authMiddleware.js'

const router = Router()

router.post('/create', isAregisteredTeacher, createReport)

export default router