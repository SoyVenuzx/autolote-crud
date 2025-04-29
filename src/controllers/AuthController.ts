import { Request, Response } from 'express'
import authService from '../services/AuthService'

class AuthController {
  /**
   * Registra un nuevo usuario
   */
  async register (req: Request, res: Response): Promise<void> {
    try {
      const { email, username, password } = req.body

      // Validaciones básicas
      if (!email || !username || !password) {
        res.status(400).json({ message: 'Todos los campos son requeridos' })
        return
      }

      // Registrar usuario
      const user = await authService.register({ email, username, password })

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user
      })
    } catch (error) {
      console.error('Error en registro:', error)
      res.status(400).json({
        message:
          error instanceof Error ? error.message : 'Error al registrar usuario'
      })
    }
  }

  /**
   * Inicia sesión de usuario
   */
  async login (req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body

      // Validaciones básicas
      if (!email || !password) {
        res.status(400).json({ message: 'Email y contraseña son requeridos' })
        return
      }

      // Autenticar usuario
      const { user, token } = await authService.login({ email, password })

      const newUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles.map(({ name, description }) => ({
          name,
          description
        })),
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        token
      }

      // Configurar cookie HTTP-only con el token
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Solo https en producción
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      })

      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        user: newUser
      })
    } catch (error) {
      console.error('Error en login:', error)
      res.status(401).json({
        message:
          error instanceof Error ? error.message : 'Error al iniciar sesión'
      })
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  async logout (req: Request, res: Response): Promise<void> {
    try {
      // Limpiar la cookie del token
      res.clearCookie('token')

      res.status(200).json({ message: 'Sesión cerrada exitosamente' })
    } catch (error) {
      console.error('Error en logout:', error)
      res.status(500).json({ message: 'Error al cerrar sesión' })
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado
   */
  async getProfile (req: Request, res: Response): Promise<void> {
    try {
      // El middleware authenticate ya agregó el usuario al request
      if (!req.user) {
        res.status(401).json({ message: 'Usuario no autenticado' })
        return
      }

      res.status(200).json({
        message: 'Perfil obtenido exitosamente',
        user: req.user
      })
    } catch (error) {
      console.error('Error al obtener perfil:', error)
      res.status(500).json({ message: 'Error al obtener perfil de usuario' })
    }
  }
}

export default new AuthController()
