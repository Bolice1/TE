import {Router} from 'express'
import { registerTeacher } from '../controllers/teacherController'
import { isAregisteredTeacher } from '../middlewares/authMiddleware'

const router = Router()