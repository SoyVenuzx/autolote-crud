import { Router } from 'express'
import { ProveedorController } from './proveedor.controller'
import { authenticate, authorize } from '@/middlewares/authMiddleware'

const router = Router()
const proveedorController = new ProveedorController()

router.get('/', authenticate, authorize(['admin']), proveedorController.getAll)
router.get(
  '/:id',
  authenticate,
  authorize(['admin']),
  proveedorController.getById
)
router.post('/', authenticate, authorize(['admin']), proveedorController.create)
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  proveedorController.update
)
router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  proveedorController.delete
)

export default router
