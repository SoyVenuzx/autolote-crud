import Role from '@/models/Role.model'
import User from '@/models/User.model'
import { Request, Response } from 'express'
import { Op } from 'sequelize'

export const getUsers = async (req: Request, res: Response) => {
  const users = await User.findAll({
    attributes: ['id', 'email', 'username', 'isActive', 'lastLogin'],
    include: [Role]
  })

  const formattedUsers = users.map(user => {
    const userJson = user.toJSON() // Convertir la instancia a un objeto JSON
    return {
      ...userJson,
      roles: userJson.roles.map((role: any) => ({
        name: role.name
      }))
    }
  })

  return void res.status(200).json({
    message: 'Lista de usuarios',
    data: formattedUsers
  })
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, username, password, role } = req.body

    if (!email || !username || !password || !role) {
      return void res
        .status(400)
        .json({ message: 'Todos los campos son requeridos' })
    }

    const existringUser = await User.findOne({
      where: {
        [Op.or]: [{ email: email }, { username: username }]
      }
    })

    if (existringUser) {
      return void res
        .status(400)
        .json({ message: 'El email o el nombre de usuario ya están en uso' })
    }

    const newUser = await User.create({
      email,
      username,
      password
    })

    const newUserRole = await Role.findOne({
      where: { name: role }
    })

    if (newUserRole) {
      await newUser.$add('roles', [newUserRole.id])
    }

    try {
      await newUserRole?.reload({ include: [Role] })
    } catch (error) {
      console.error('Error al recargar el rol del usuario:', error)
    }

    await getUsers(req, res)
  } catch (error) {
    console.error('Error en registro:', error)
    return void res.status(400).json({
      message:
        error instanceof Error ? error.message : 'Error al registrar usuario'
    })
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  let { id } = req.params

  id = id.replace(/"/g, '')

  console.log('ID de usuario:', id)

  if (!id) {
    return void res.status(400).json({ message: 'ID de usuario requerido' })
  }
  const user = await User.findByPk(id)

  if (!user) {
    return void res.status(404).json({ message: 'Usuario no encontrado' })
  }
  await user.destroy()

  await getUsers(req, res)
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { email, username, password, role } = req.body

    // Verificar que se proporcione al menos un campo para actualizar
    if (!email && !username && !password && !role) {
      return void res.status(400).json({
        message: 'Debe proporcionar al menos un campo para actualizar'
      })
    }

    // Buscar el usuario a actualizar
    const userToUpdate = await User.findByPk(id)
    if (!userToUpdate) {
      return void res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Si se va a actualizar email o username, verificar que no estén en uso
    if (email || username) {
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            ...(email ? [{ email: email }] : []),
            ...(username ? [{ username: username }] : [])
          ],
          id: { [Op.ne]: id } // Excluir el usuario actual de la búsqueda
        }
      })

      if (existingUser) {
        return void res.status(400).json({
          message:
            'El email o el nombre de usuario ya están en uso por otro usuario'
        })
      }
    }

    // Actualizar los campos proporcionados
    const updateData: Partial<typeof userToUpdate> = {}
    if (email) updateData.email = email
    if (username) updateData.username = username
    if (password) updateData.password = password

    await userToUpdate.update(updateData)

    // Actualizar rol si se proporciona
    if (role) {
      const newUserRole = await Role.findOne({
        where: { name: role }
      })

      if (newUserRole) {
        // Eliminar roles anteriores y asignar el nuevo
        await userToUpdate.$set('roles', [newUserRole.id])
      } else {
        return void res
          .status(400)
          .json({ message: 'El rol especificado no existe' })
      }

      try {
        await userToUpdate.reload({ include: [Role] })
      } catch (error) {
        console.error('Error al recargar el rol del usuario:', error)
      }
    }

    // Devolver la lista actualizada de usuarios
    await getUsers(req, res)
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    return void res.status(400).json({
      message:
        error instanceof Error ? error.message : 'Error al actualizar usuario'
    })
  }
}

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params

    if (!id) {
      res.status(400).json({ message: 'Se requiere un ID de usuario' })
      return
    }

    const user = await User.findByPk(id, {
      include: [
        {
          model: Role,
          through: { attributes: [] } // Excluye los atributos de la tabla intermedia
        }
      ],
      attributes: { exclude: ['password'] } // Excluye la contraseña por seguridad
    })

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' })
      return
    }

    res.status(200).json({
      message: 'Usuario obtenido exitosamente',
      user
    })
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error)
    res.status(500).json({
      message: 'Error al obtener información del usuario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    })
  }
}
