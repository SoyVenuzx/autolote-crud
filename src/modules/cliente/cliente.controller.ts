// src/modules/cliente/cliente.controller.ts
import { Request, Response, NextFunction } from 'express'
import { ClienteService } from './cliente.service'
import { CreateClienteDto, UpdateClienteDto } from './cliente.dto'

export class ClienteController {
  private clienteService: ClienteService

  constructor () {
    this.clienteService = new ClienteService()
  }

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateClienteDto = req.body
      if (!data.contacto_id) {
        res
          .status(400)
          .json({ message: 'El campo contacto_id es obligatorio.' })
      }
      const nuevoCliente = await this.clienteService.create(data)
      res.status(201).json(nuevoCliente)
    } catch (error: any) {
      console.error('[ClienteController] Error en create:', error)
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

      const { rows, count } = await this.clienteService.getAll(
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
      console.error('[ClienteController] Error en getAll:', error)
      res
        .status(500)
        .json({ message: error.message || 'Error interno del servidor.' })
    }
  }

  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID de cliente inválido.' })
      }
      const cliente = await this.clienteService.getById(id)
      res.status(200).json(cliente)
    } catch (error: any) {
      console.error('[ClienteController] Error en getById:', error)
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
        res.status(400).json({ message: 'ID de cliente inválido.' })
      }
      const data: UpdateClienteDto = req.body
      if (Object.keys(data).length === 0) {
        res
          .status(400)
          .json({ message: 'No se proporcionaron datos para actualizar.' })
      }
      const clienteActualizado = await this.clienteService.update(id, data)
      res.status(200).json(clienteActualizado)
    } catch (error: any) {
      console.error('[ClienteController] Error en update:', error)
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
        res.status(400).json({ message: 'ID de cliente inválido.' })
      }
      await this.clienteService.delete(id)
      res.status(200).json({ message: 'Cliente eliminado correctamente.' })
    } catch (error: any) {
      console.error('[ClienteController] Error en delete:', error)
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
        res.status(400).json({ message: 'ID de cliente inválido.' })
      }
      const cliente = await this.clienteService.toggleActivo(id)
      res.status(200).json(cliente)
    } catch (error: any) {
      console.error('[ClienteController] Error en toggleActivo:', error)
      if (error.message.includes('no encontrado')) {
        res.status(404).json({ message: error.message })
      }
      if (error.message.includes('No se puede activar el cliente')) {
        res.status(409).json({ message: error.message }) // Conflict
      }
      res
        .status(500)
        .json({ message: error.message || 'Error interno del servidor.' })
    }
  }
}
