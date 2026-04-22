import {Router} from 'express'
import { registerTeacher } from '../controllers/teacherController.js'
import { isAregisteredTeacher } from '../middlewares/authMiddleware.js'

const router = Router()