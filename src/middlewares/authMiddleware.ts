import { Request, Response, NextFunction } from 'express'
import authService, { TokenPayload } from '../services/AuthService'

// Extender el tipo Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}

/**
 * Middleware para verificar la autenticación del usuario
 */
// export const authenticate = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): void => {
//   try {
//     const token = extractTokenFromRequest(req)
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractTokenFromRequest(req)

    if (!token) {
      res.status(401).json({ message: 'No token provided' })
      return
    }

    const decodedToken = authService.verifyToken(token)

    if (!decodedToken) {
      res.status(401).json({ message: 'Invalid or expired token' })
      return
    }

    // Añadir la información del usuario al request
    req.user = decodedToken
    next()
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(401).json({ message: 'Authentication failed' })
  }
}
//     if (!token) {
//       res.status(401).json({ message: 'No token provided' })
//       return
//     }

//     const decodedToken = authService.verifyToken(token)

//     if (!decodedToken) {
//       res.status(401).json({ message: 'Invalid or expired token' })
//       return
//     }

//     // Añadir la información del usuario al request
//     req.user = decodedToken
//     next()
//   } catch (error) {
//     console.error('Authentication error:', error)
//     res.status(401).json({ message: 'Authentication failed' })
//   }
// }

/**
 * Middleware para verificar si el usuario tiene un rol específico
 * @param roles - Roles permitidos
 */
export const authorize = (roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized - No user found' })
        return
      }

      // Si no se especifican roles, permite a cualquier usuario autenticado
      if (roles.length === 0) {
        next()
        return
      }

      // Verificar si el usuario tiene alguno de los roles requeridos
      const formattedRoles = roles.map(role => `ROLE_${role.toUpperCase()}`)
      const hasRole = req.user.roles.some(role => formattedRoles.includes(role))

      if (!hasRole) {
        res
          .status(403)
          .json({ message: 'Forbidden - Insufficient permissions' })
        return
      }

      next()
    } catch (error) {
      console.error('Authorization error:', error)
      res.status(403).json({ message: 'Authorization failed' })
    }
  }
}

/**
 * Extrae el token JWT de la solicitud
 * Busca en: cookies http-only, Authorization header, o query parameter
 */
const extractTokenFromRequest = (req: Request): string | null => {
  // 1. Intentar obtener de cookie HTTP-only
  if (req.cookies && req.cookies.token) {
    return req.cookies.token
  }

  // 2. Intentar obtener del header Authorization
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7) // Remover 'Bearer ' del inicio
  }

  // 3. Intentar obtener de query parameter (menos seguro, solo para casos específicos)
  if (req.query && req.query.token) {
    return req.query.token as string
  }

  return null
}
