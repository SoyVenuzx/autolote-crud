import { Request, Response } from 'express'
import TipoCombustible from '@/models/TipoCombustible.model'

export const getTipoCombustible = async (req: Request, res: Response) => {
  const data = await TipoCombustible.findAll()

  return void res.json({
    data
  })
}
