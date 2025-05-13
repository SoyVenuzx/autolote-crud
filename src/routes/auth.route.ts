import express from 'express'
import AuthController from '@/controllers/AuthController'
import { authenticate, authorize } from '../middlewares/authMiddleware'
import { getUsers } from '@/handlers/user'

const router = express.Router()

// Rutas públicas
router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.post('/logout', AuthController.logout)

// Rutas protegidas
router.get('/profile', authenticate, AuthController.getProfile)
router.get('/get-users', getUsers)
router.get('/verify', authenticate, AuthController.verifyToken)

// Ejemplo de ruta que requiere rol específico
router.get('/admin', authenticate, authorize(['admin']), (req, res) => {
  res.json({ message: 'Acceso al panel de administración' })
})

export default router
