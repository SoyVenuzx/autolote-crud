import Color from '@/models/Color.model'
import { Request, Response } from 'express'

export const getColor = async (req: Request, res: Response) => {
  const data = await Color.findAll()

  return void res.json({
    data
  })
}

export const createColor = async (req: Request, res: Response) => {
  try {
    const newColor = await Color.create(req.body)

    res.status(201).json({
      message: 'Color created successfully',
      data: newColor
    })
  } catch (error: Error | any) {
    res.status(500).json({
      message: 'Error creating color',
      error: error.message
    })
  }
}
