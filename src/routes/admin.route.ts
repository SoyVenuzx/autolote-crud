import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser
} from '@/handlers/user'
import { authenticate, authorize } from '@/middlewares/authMiddleware'
import { Router } from 'express'

const router = Router()

router.get('/get-users', authenticate, authorize(['admin']), getUsers)
router.post('/create-user', authenticate, authorize(['admin']), createUser)
router.delete(
  '/delete-user/:id',
  authenticate,
  authorize(['admin']),
  deleteUser
)
router.put('/update-user/:id', authenticate, authorize(['admin']), updateUser)
router.get('/get-user/:id', authenticate, authorize(['admin']), getUserById)

export default router
