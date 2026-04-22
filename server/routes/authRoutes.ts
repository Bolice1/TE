import {Router} from 'express'
import { registerTeacher } from '../controllers/teacherController.js'
import { isAregisteredTeacher } from '../middlewares/authMiddleware.js'
import limiter from '../middlewares/rateLimitor.js'

const router = Router()

router.post('/register', registerTeacher)
router.get('/is-registered',isAregisteredTeacher)

export default router