import { Router } from 'express'
import { ClienteController } from './cliente.controller'
import { authenticate, authorize } from '@/middlewares/authMiddleware'

const router = Router()
const clienteController = new ClienteController()

router.get('/', authenticate, authorize(['admin']), clienteController.getAll)
router.get(
  '/:id',
  authenticate,
  authorize(['admin']),
  clienteController.getById
)
router.post('/', authenticate, authorize(['admin']), clienteController.create)
router.put('/:id', authenticate, authorize(['admin']), clienteController.update)
router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  clienteController.delete
)

export default router
