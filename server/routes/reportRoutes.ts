import {Router} from 'express'
import { createReport,getAllReports, getReportById } from '../controllers/reportController.js'
import { isAregisteredTeacher } from '../middlewares/authMiddleware.js'

const router = Router()

router.post('/create', isAregisteredTeacher, createReport)
router.get('/reports', isAregisteredTeacher, getAllReports)
router.get('/reports/:id', isAregisteredTeacher, getReportById)

export default router