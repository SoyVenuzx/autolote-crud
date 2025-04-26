import { Request, Response } from 'express'
import TipoCombustible from '@/models/TipoCombustible.model'

export const getTipoCombustible = async (req: Request, res: Response) => {
  const data = await TipoCombustible.findAll()

  return void res.json({
    data
  })
}

export const createTipoCombustible = async (req: Request, res: Response) => {
  try {
    const { tipo } = req.body

    if (!tipo) {
      res.status(400).json({
        message: "Fields 'tipo' is required"
      })
      return
    }

    const newTipo = await TipoCombustible.create({
      nombre: tipo
    })

    res.status(201).json({
      data: newTipo
    })
  } catch (error: Error | any) {
    res.status(500).json({
      message: 'Error creating tipo combustible',
      error: error.message
    })
  }
}
