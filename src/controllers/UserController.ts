import Role from '@/models/Role.model'
import User from '@/models/User.model'
import { Request, Response } from 'express'

class UserController {
  async assignRole (req: Request, res: Response): Promise<void> {
    try {
      const { userId, roleId } = req.body

      // Validaciones básicas
      if (!userId || !roleId) {
        res.status(400).json({ message: 'userId y roleId son requeridos' })
        return
      }

      // Asignar rol al usuario
      const user = await User.findByPk(userId)
      const role = await Role.findByPk(roleId)

      if (!user || !role) {
        res.status(404).json({ message: 'Usuario o rol no encontrado' })
        return
      }

      const repeatedRole = await user.$get('roles', {
        where: { id: roleId }
      })

      if (repeatedRole.length) {
        res
          .status(400)
          .json({ message: 'El rol ya está asignado a este usuario' })
        return
      }

      await user.$add('roles', role.id)

      res.status(200).json({
        message: 'Rol asignado exitosamente',
        user,
        role
      })
    } catch (error) {
      console.error('Error en asignación de rol:', error)
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al asignar rol'
      })
    }
  }

  async removeRole (req: Request, res: Response): Promise<void> {
    try {
      const { userId, roleId } = req.body

      if (!userId || !roleId) {
        res.status(400).json({ message: 'userId y roleId son requeridos' })
        return
      }

      const user = await User.findByPk(userId)
      const role = await Role.findByPk(roleId)

      if (!user || !role) {
        res.status(404).json({ message: 'Usuario o rol no encontrado' })
        return
      }

      const roles = await user.$get('roles')

      if (!roles.length) {
        res.status(400).json({ message: 'El usuario no tiene roles asignados' })
        return
      }

      await user.$remove('roles', roleId)

      res.status(200).json({
        message: 'Rol eliminado exitosamente',
        user,
        role
      })
    } catch (error) {
      console.error('Error en eliminación de rol:', error)
      res.status(500).json({
        message:
          error instanceof Error ? error.message : 'Error al eliminar rol'
      })
    }
  }
}

export default new UserController()
