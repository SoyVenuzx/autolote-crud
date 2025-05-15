import { Request, Response, NextFunction } from 'express'
import { ProveedorService } from './proveedor.service'
import { CreateProveedorDto, UpdateProveedorDto } from './proveedor.dto'

export class ProveedorController {
  private proveedorService: ProveedorService

  constructor () {
    this.proveedorService = new ProveedorService()
  }

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateProveedorDto = req.body
      if (!data.contacto_id) {
        res
          .status(400)
          .json({ message: 'El campo contacto_id es obligatorio.' })
      }
      const nuevoProveedor = await this.proveedorService.create(data)
      res.status(201).json(nuevoProveedor)
    } catch (error: any) {
      console.error('[ProveedorController] Error en create:', error)
      res
        .status(
          error.message.includes('no existe') ||
            error.message.includes('ya está asignado')
            ? 400
            : 500
        )
        .json({ message: error.message || 'Error interno del servidor.' })
    }
  }

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const searchTerm = req.query.searchTerm as string | undefined
      const activo = req.query.activo as string | undefined

      const { rows, count } = await this.proveedorService.getAll(
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
      console.error('[ProveedorController] Error en getAll:', error)
      res
        .status(500)
        .json({ message: error.message || 'Error interno del servidor.' })
    }
  }

  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID de proveedor inválido.' })
      }
      const proveedor = await this.proveedorService.getById(id)
      res.status(200).json(proveedor)
    } catch (error: any) {
      console.error('[ProveedorController] Error en getById:', error)
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
        res.status(400).json({ message: 'ID de proveedor inválido.' })
      }
      const data: UpdateProveedorDto = req.body
      if (Object.keys(data).length === 0) {
        res
          .status(400)
          .json({ message: 'No se proporcionaron datos para actualizar.' })
      }
      const proveedorActualizado = await this.proveedorService.update(id, data)
      res.status(200).json(proveedorActualizado)
    } catch (error: any) {
      console.error('[ProveedorController] Error en update:', error)
      if (error.message.includes('no encontrado')) {
        res.status(404).json({ message: error.message })
      }
      if (
        error.message.includes('no existe') ||
        error.message.includes('ya está asignado')
      ) {
        res.status(400).json({ message: error.message })
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
        res.status(400).json({ message: 'ID de proveedor inválido.' })
      }
      await this.proveedorService.delete(id)
      res.status(200).json({ message: 'Proveedor eliminado correctamente.' })
    } catch (error: any) {
      console.error('[ProveedorController] Error en delete:', error)
      if (error.message.includes('no encontrado')) {
        res.status(404).json({ message: error.message })
      }
      if (error.message.includes('No se puede eliminar')) {
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
        res.status(400).json({ message: 'ID de proveedor inválido.' })
      }
      const proveedor = await this.proveedorService.toggleActivo(id)
      res.status(200).json(proveedor)
    } catch (error: any) {
      console.error('[ProveedorController] Error en toggleActivo:', error)
      if (error.message.includes('no encontrado')) {
        res.status(404).json({ message: error.message })
      }
      if (error.message.includes('No se puede activar el proveedor')) {
        res.status(409).json({ message: error.message }) // Conflict
      }
      res
        .status(500)
        .json({ message: error.message || 'Error interno del servidor.' })
    }
  }
}
