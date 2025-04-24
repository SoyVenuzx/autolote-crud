import Color from '@/models/Color.model'
import { Request, Response } from 'express'

export const getColor = async (req: Request, res: Response) => {
  const data = await Color.findAll()

  return void res.json({
    data
  })
}
