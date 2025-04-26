import Marca from '@/models/Marca.model'
import Modelo from '@/models/Modelo.model'
import { Request, Response } from 'express'

export const getModelo = async (req: Request, res: Response) => {
  // const data = await Modelo.findAll()

  const data = await Modelo.findAll({
    include: [
      {
        model: Marca,
        attributes: ['id', 'nombre']
      }
    ],
    order: [['nombre', 'ASC']],
    attributes: { exclude: ['createdAt', 'updatedAt'] }
  })

  return void res.json({
    data
  })
}

export const createModelo = async (req: Request, res: Response) => {
  try {
    const { id, nombre } = req.body

    if (!id || !nombre) {
      res.status(400).json({
        message: 'Fields marca_id and nombre are required'
      })
      return
    }

    const modelo = await Modelo.create({
      marca_id: id,
      nombre
    })

    res.status(201).json({
      message: 'Modelo created successfully',
      data: modelo
    })
  } catch (error: Error | any) {
    res.status(500).json({
      message: 'Error creating modelo',
      error: error.message
    })
  }
}
