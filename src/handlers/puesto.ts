import Puesto from '@/models/Puesto.model'
import { Request, Response } from 'express'

export const getPuesto = async (req: Request, res: Response) => {
  const data = await Puesto.findAll()

  return void res.json({
    data
  })
}

export const createPuesto = async (req: Request, res: Response) => {
  try {
    const { puesto, descripcion } = req.body

    if (!puesto || !descripcion) {
      res.status(400).json({
        message: 'Fields nombre_puesto and descripcion are required'
      })
      return
    }

    const newPuesto = await Puesto.create({
      nombre_puesto: puesto,
      descripcion
    })

    res.status(201).json({
      message: 'Puesto created successfully',
      data: newPuesto
    })
  } catch (error: Error | any) {
    res.status(500).json({
      message: 'Error creating puesto',
      error: error.message
    })
  }
}
