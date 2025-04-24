import Puesto from '@/models/Puesto.model'
import { Request, Response } from 'express'

export const getPuesto = async (req: Request, res: Response) => {
  const data = await Puesto.findAll()

  return void res.json({
    data
  })
}
