import { Request, Response } from 'express'
import { CaracteristicaOpcional } from '@/models/CaracteristicaOpcional.model'

export const getCaracteristicaOpcional = async (
  req: Request,
  res: Response
) => {
  const data = await CaracteristicaOpcional.findAll()

  return void res.json({
    data
  })
}
