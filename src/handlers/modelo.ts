import Modelo from '@/models/Modelo.model'
import { Request, Response } from 'express'

export const getModelo = async (req: Request, res: Response) => {
  const data = await Modelo.findAll()

  return void res.json({
    data
  })
}
