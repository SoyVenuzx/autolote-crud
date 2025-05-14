import { Request, Response } from 'express'
import authService from '../services/AuthService'
import jwt from 'jsonwebtoken'

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
        roles: user.roles.map((role: any) => `ROLE_${role.name.toUpperCase()}`),
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        token
      }

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Solo https en producción
        sameSite: 'lax', // Cambiado de 'strict' a 'lax' para mayor compatibilidad
        maxAge: 48 * 60 * 60 * 1000, // 1 hora
        path: '/' // Asegura que la cookie esté disponible en todas las rutas
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

  async verifyToken (req: Request, res: Response): Promise<void> {
    try {
      const token = req.cookies.token

      if (!token) {
        res.status(401).json({ message: 'No token provided' })
        return
      }

      const decodedToken = authService.verifyToken(token)
      console.log('Decoded token:', decodedToken)

      if (!decodedToken) {
        res.status(401).json({ message: 'Invalid or expired token' })
        return
      }

      res.status(200).json({
        message: 'Token válido',
        user: decodedToken
      })
    } catch (error) {
      console.error('Error al verificar token:', error)
      res.status(500).json({ message: 'Error al verificar token' })
    }
  }
}

export default new AuthController()
