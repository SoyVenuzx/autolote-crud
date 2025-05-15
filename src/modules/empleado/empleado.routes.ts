import { Router } from 'express'
import { EmpleadoController } from './empleado.controller'
import { authenticate, authorize } from '@/middlewares/authMiddleware'

const router = Router()
const empleadoController = new EmpleadoController()

router.get('/', authenticate, authorize(['admin']), empleadoController.getAll)
router.get(
  '/:id',
  authenticate,
  authorize(['admin']),
  empleadoController.getById
)
router.post('/', authenticate, authorize(['admin']), empleadoController.create)
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  empleadoController.update
)
router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  empleadoController.delete
)

export default router
