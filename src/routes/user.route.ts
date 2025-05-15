import UserController from '@/controllers/UserController'
import { authenticate, authorize } from '@/middlewares/authMiddleware'
import { Router } from 'express'

const router = Router()

router.post(
  '/assign-role',
  authenticate,
  authorize(['admin']),
  UserController.assignRole
)
router.post(
  '/remove-role',
  authenticate,
  authorize(['admin']),
  UserController.removeRole
)
router.get(
  '/get-roles',
  authenticate,
  authorize(['admin']),
  UserController.listAllRoles
)

export default router
