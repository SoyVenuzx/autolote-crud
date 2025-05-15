import { Request, Response, NextFunction } from 'express'
import { PuestoService } from './puesto.service'
import { CreatePuestoDto, UpdatePuestoDto } from './puesto.dto'

export class PuestoController {
  private puestoService: PuestoService

  constructor () {
    this.puestoService = new PuestoService()
  }

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreatePuestoDto = req.body
      if (!data.nombre_puesto) {
        res
          .status(400)
          .json({ message: 'El campo nombre_puesto es obligatorio.' })
      }
      const nuevoPuesto = await this.puestoService.create(data)

      res.status(201).json(nuevoPuesto)
    } catch (error: any) {
      console.error('[PuestoController] Error en create:', error)
      res
        .status(500)
        .json({ message: error.message || 'Error interno del servidor.' })
    }
  }

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const searchTerm = req.query.searchTerm as string | undefined
      const activo = req.query.activo as string | undefined

      const { rows, count } = await this.puestoService.getAll(
        page,
        limit,
        searchTerm,
        activo
      )
      res.status(200).json({
        data: rows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      })
    } catch (error: any) {
      console.error('[PuestoController] Error en getAll:', error)
      res
        .status(500)
        .json({ message: error.message || 'Error interno del servidor.' })
    }
  }

  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID de puesto inválido.' })
      }
      const puesto = await this.puestoService.getById(id)
      res.status(200).json(puesto)
    } catch (error: any) {
      console.error('[PuestoController] Error en getById:', error)
      if (error.message.includes('no encontrado')) {
        res.status(404).json({ message: error.message })
      }
      res
        .status(500)
        .json({ message: error.message || 'Error interno del servidor.' })
    }
  }

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID de puesto inválido.' })
      }
      const data: UpdatePuestoDto = req.body
      if (Object.keys(data).length === 0) {
        res
          .status(400)
          .json({ message: 'No se proporcionaron datos para actualizar.' })
      }
      const puestoActualizado = await this.puestoService.update(id, data)
      res.status(200).json(puestoActualizado)
    } catch (error: any) {
      console.error('[PuestoController] Error en update:', error)
      if (error.message.includes('no encontrado')) {
        res.status(404).json({ message: error.message })
      }
      res
        .status(500)
        .json({ message: error.message || 'Error interno del servidor.' })
    }
  }

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID de puesto inválido.' })
      }
      await this.puestoService.delete(id)
      res.status(200).json({ message: 'Puesto eliminado correctamente.' })
    } catch (error: any) {
      console.error('[PuestoController] Error en delete:', error)
      if (error.message.includes('no encontrado')) {
        res.status(404).json({ message: error.message })
      }
      if (error.message.includes('No se puede eliminar el puesto')) {
        res.status(409).json({ message: error.message }) // Conflict
      }
      res
        .status(500)
        .json({ message: error.message || 'Error interno del servidor.' })
    }
  }

  public toggleActivo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID de puesto inválido.' })
      }
      const puesto = await this.puestoService.toggleActivo(id)
      res.status(200).json(puesto)
    } catch (error: any) {
      console.error('[PuestoController] Error en toggleActivo:', error)
      if (error.message.includes('no encontrado')) {
        res.status(404).json({ message: error.message })
      }
      res
        .status(500)
        .json({ message: error.message || 'Error interno del servidor.' })
    }
  }
}
