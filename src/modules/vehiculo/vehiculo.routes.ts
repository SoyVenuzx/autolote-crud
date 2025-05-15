import { authenticate, authorize } from '@/middlewares/authMiddleware'
import { Router } from 'express'
import { VehiculoController } from './vehiculo.controller'

const router = Router()
const vehiculoController = new VehiculoController()

router.post('/', authenticate, authorize(['admin']), vehiculoController.create)
router.get('/', authenticate, authorize(['admin']), vehiculoController.getAll)
router.get(
  '/:id',
  authenticate,
  authorize(['admin']),
  vehiculoController.getById
)
router.post('/', authenticate, authorize(['admin']), vehiculoController.create)
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  vehiculoController.update
)
router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  vehiculoController.delete
)

export default router
