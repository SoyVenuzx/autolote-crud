import Marca from '@/models/Marca.model'
import { Request, Response } from 'express'

export const getMarca = async (req: Request, res: Response) => {
  const data = await Marca.findAll()

  return void res.json({
    data
  })
}
