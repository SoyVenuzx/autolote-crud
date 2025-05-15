// src/modules/empleado/empleado.controller.ts
import { Request, Response, NextFunction } from 'express'
import { EmpleadoService } from './empleado.service'
import { CreateEmpleadoDto, UpdateEmpleadoDto } from './empleado.dto'

export class EmpleadoController {
  private empleadoService: EmpleadoService

  constructor () {
    this.empleadoService = new EmpleadoService()
  }

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateEmpleadoDto = req.body
      if (!data.contacto_id || !data.puesto_id) {
        res.status(400).json({
          message: 'Los campos contacto_id y puesto_id son obligatorios.'
        })
      }

      const { rows, count } = await this.empleadoService.create(data)

      res.status(201).json({
        data: rows,
        totalItems: count,
        totalPages: Math.ceil(count / 10),
        currentPage: 1
      })
    } catch (error: any) {
      console.error('[EmpleadoController] Error en create:', error)
      let statusCode = 500
      if (
        error.message.includes('no existe') ||
        error.message.includes('ya está asignado') ||
        error.message.includes('no está activo') ||
        error.message.includes('fecha de desvinculación')
      ) {
        statusCode = 400
      }
      res
        .status(statusCode)
        .json({ message: error.message || 'Error interno del servidor.' })
    }
  }

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const searchTerm = req.query.searchTerm as string | undefined
      const activo = req.query.activo as string | undefined
      const puestoId = req.query.puestoId
        ? parseInt(req.query.puestoId as string)
        : undefined

      const { rows, count } = await this.empleadoService.getAll(
        page,
        limit,
        searchTerm,
        activo,
        puestoId
      )
      res.status(200).json({
        data: rows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      })
    } catch (error: any) {
      console.error('[EmpleadoController] Error en getAll:', error)
      res
        .status(500)
        .json({ message: error.message || 'Error interno del servidor.' })
    }
  }

  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID de empleado inválido.' })
      }
      const empleado = await this.empleadoService.getById(id)
      res.status(200).json(empleado)
    } catch (error: any) {
      console.error('[EmpleadoController] Error en getById:', error)
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
        res.status(400).json({ message: 'ID de empleado inválido.' })
      }
      const data: UpdateEmpleadoDto = req.body
      if (Object.keys(data).length === 0) {
        res
          .status(400)
          .json({ message: 'No se proporcionaron datos para actualizar.' })
      }
      const empleadoActualizado = await this.empleadoService.update(id, data)
      res.status(200).json(empleadoActualizado)
    } catch (error: any) {
      console.error('[EmpleadoController] Error en update:', error)
      let statusCode = 500
      if (error.message.includes('no encontrado')) {
        statusCode = 404
      } else if (
        error.message.includes('no existe') ||
        error.message.includes('ya está asignado') ||
        error.message.includes('no está activo') ||
        error.message.includes('fecha de desvinculación')
      ) {
        statusCode = 400
      }
      res
        .status(statusCode)
        .json({ message: error.message || 'Error interno del servidor.' })
    }
  }

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID de empleado inválido.' })
      }
      const { rows, count } = await this.empleadoService.delete(id)

      res.status(200).json({
        message: 'Empleado eliminado correctamente.',
        data: rows,
        totalItems: count,
        totalPages: Math.ceil(count / 10),
        currentPage: 1
      })
    } catch (error: any) {
      console.error('[EmpleadoController] Error en delete:', error)
      let statusCode = 500
      if (error.message.includes('no encontrado')) {
        statusCode = 404
      } else if (
        error.message.includes('No se puede eliminar') ||
        error.message.includes('No se puede desactivar')
      ) {
        statusCode = 409 // Conflict
      }
      res
        .status(statusCode)
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
        res.status(400).json({ message: 'ID de empleado inválido.' })
      }
      const empleado = await this.empleadoService.toggleActivo(id)
      res.status(200).json(empleado)
    } catch (error: any) {
      console.error('[EmpleadoController] Error en toggleActivo:', error)
      let statusCode = 500
      if (error.message.includes('no encontrado')) {
        statusCode = 404
      } else if (
        error.message.includes('No se puede activar') ||
        error.message.includes('No se puede desactivar')
      ) {
        statusCode = 409 // Conflict
      }
      res
        .status(statusCode)
        .json({ message: error.message || 'Error interno del servidor.' })
    }
  }
}
