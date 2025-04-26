import { Request, Response } from 'express'
import TipoTransmision from '@/models/TipoTransmision.model'

export const getTipoTransmision = async (req: Request, res: Response) => {
  const data = await TipoTransmision.findAll()

  return void res.json({
    data
  })
}

export const createTipoTransmision = async (req: Request, res: Response) => {
  try {
    const { tipo } = req.body

    if (!tipo) {
      res.status(400).json({
        message: "Fields 'tipo' is required"
      })
    }

    const newTipo = await TipoTransmision.create({
      nombre: tipo
    })

    res.status(201).json({
      messagee: 'Tipo Transmision created successfully',
      data: newTipo
    })
  } catch (error: Error | any) {
    res.status(500).json({
      message: 'Error creating tipo transmision',
      error: error.message
    })
  }
}
