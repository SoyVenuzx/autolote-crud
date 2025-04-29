import UserController from '@/controllers/UserController'
import { Router } from 'express'

const router = Router()

router.post('/assign-role', UserController.assignRole)
router.post('/remove-role', UserController.removeRole)

export default router
