import { authenticate, authorize } from '@/middlewares/authMiddleware'
import { Router } from 'express'
import { PuestoController } from './puesto.controller'

const router = Router()
const puestoConotroller = new PuestoController()

router.get('/', authenticate, authorize(['admin']), puestoConotroller.getAll)
router.get(
  '/:id',
  authenticate,
  authorize(['admin']),
  puestoConotroller.getById
)
router.post('/', authenticate, authorize(['admin']), puestoConotroller.create)
router.put('/', authenticate, authorize(['admin']), puestoConotroller.update)
router.delete('/', authenticate, authorize(['admin']), puestoConotroller.delete)

export default router
