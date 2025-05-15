import { Router } from 'express'
import { ContactoController } from './contacto.controller'
import { authenticate, authorize } from '@/middlewares/authMiddleware'

const router = Router()
const contactoController = new ContactoController()

router.get('/', authenticate, authorize(['admin']), contactoController.getAll)
router.get(
  '/:id',
  authenticate,
  authorize(['admin']),
  contactoController.getById
)
router.post('/', authenticate, authorize(['admin']), contactoController.create)
router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  contactoController.delete
)
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  contactoController.update
)

export default router
