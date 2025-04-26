import Marca from '@/models/Marca.model'
import { Request, Response } from 'express'

export const getMarca = async (req: Request, res: Response) => {
  const data = await Marca.findAll()

  return void res.json({
    data
  })
}

export const createMarca = async (req: Request, res: Response) => {
  try {
    const marca = await Marca.create(req.body)

    res.status(201).json({
      message: 'Marca created successfully',
      data: marca
    })
  } catch (error: Error | any) {
    res.status(500).json({
      message: 'Error creating marca',
      error: error.message
    })
  }
}
