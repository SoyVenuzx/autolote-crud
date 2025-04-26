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

export const createCaracteristicaOpcional = async (
  req: Request,
  res: Response
) => {
  try {
    const { nombre, descripcion } = req.body

    if (!nombre || !descripcion) {
      res.status(400).json({
        message: "Fields 'nombre' and 'descripcion' are required"
      })
      return
    }

    const newCaracteristica = await CaracteristicaOpcional.create({
      nombre_caracteristica: nombre,
      descripcion
    })

    res.status(201).json({
      message: 'Caracteristica opcional created successfully',
      dasta: newCaracteristica
    })
  } catch (error: Error | any) {
    res.status(500).json({
      message: 'Error creating caracteristica opcional',
      error: error.message
    })
  }
}
