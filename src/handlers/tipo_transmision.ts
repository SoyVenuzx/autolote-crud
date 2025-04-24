import { Request, Response } from 'express'
import TipoTransmision from '@/models/TipoTransmision.model'

export const getTipoTransmision = async (req: Request, res: Response) => {
  const data = await TipoTransmision.findAll()

  return void res.json({
    data
  })
}
