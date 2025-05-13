import jwt from 'jsonwebtoken'
import User from '../models/User.model'
import Role from '../models/Role.model'
import { Op } from 'sequelize'

export interface TokenPayload {
  id: string
  username: string
  email: string
  roles: string[]
}

class AuthService {
  private JWT_SECRET: string
  private JWT_EXPIRES_IN: string

  constructor () {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'
  }

  /**
   * Genera un JWT token
   * @param payload - Datos del usuario para incluir en el token
   * @returns Token JWT firmado
   */
  generateToken (payload: TokenPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: parseInt(this.JWT_EXPIRES_IN)
    })
  }

  /**
   * Verifica un token JWT
   * @param token - Token JWT a verificar
   * @returns Payload decodificado o null si es inválido
   */
  verifyToken (token: string): TokenPayload | null {
    // try {
    const payload = jwt.verify(token, this.JWT_SECRET) as TokenPayload
    return payload
    // } catch (error) {
    //   return null
    // }
  }

  /**
   * Registra un nuevo usuario
   * @param userData - Datos del usuario a registrar
   * @returns Usuario creado
   */
  async register (userData: {
    email: string
    username: string
    password: string
  }): Promise<User> {
    // Comprobar si el usuario ya existe
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: userData.email }, { username: userData.username }]
      }
    })

    if (existingUser) {
      throw new Error('Email o nombre de usuario ya en uso')
    }

    // Crear el usuario
    const user = await User.create({
      email: userData.email,
      username: userData.username,
      password: userData.password
    })

    // Asignar el rol de usuario por defecto
    const userRole = await Role.findOne({ where: { name: 'user' } })
    if (userRole) {
      await user.$add('roles', [userRole.id])
    }

    // Recargar el usuario con roles
    await user.reload({ include: [Role] })
    return user
  }

  /**
   * Autentica a un usuario
   * @param credentials - Credenciales del usuario
   * @returns Usuario autenticado y token
   */
  async login (credentials: {
    email: string
    password: string
  }): Promise<{ user: User; token: string }> {
    const user = await User.findOne({
      where: { email: credentials.email },
      include: [Role]
    })

    if (!user || !(await user.validatePassword(credentials.password))) {
      throw new Error('Credenciales inválidas')
    }

    if (!user.isActive) {
      throw new Error('Usuario desactivado')
    }

    // Actualizar último login
    user.lastLogin = new Date()
    await user.save()

    // Crear payload para JWT
    const payload: TokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles.map((role: any) => `ROLE_${role.name.toUpperCase()}`)
    }

    // Generar token
    const token = this.generateToken(payload)

    return { user, token }
  }
}

export default new AuthService()
