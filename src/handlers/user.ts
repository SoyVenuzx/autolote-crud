import Role from '@/models/Role.model'
import User from '@/models/User.model'
import { Request, Response } from 'express'

export const getUsers = async (req: Request, res: Response) => {
  const users = await User.findAll({
    attributes: ['id', 'email', 'username', 'isActive', 'lastLogin'],
    include: [Role]
  })

  return void res.status(200).json({
    message: 'Lista de usuarios',
    data: users
  })
}
