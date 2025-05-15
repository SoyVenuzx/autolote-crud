import { Request, Response, NextFunction } from 'express'
import { ContactoService } from './contacto.service'
import { CreateContactoDto, UpdateContactoDto } from './contacto.dto'

export class ContactoController {
  private contactoService: ContactoService

  constructor () {
    this.contactoService = new ContactoService()
  }

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateContactoDto = req.body
      if (!data.nombre_completo) {
        res
          .status(400)
          .json({ message: 'El campo nombre_completo es obligatorio.' })
      }
      const nuevoContacto = await this.contactoService.create(data)
      res.status(201).json(nuevoContacto)
    } catch (error: any) {
      console.error('[ContactoController] Error en create:', error)
      if (
        error.message.includes('ya está en uso') ||
        error.message.includes('ya existe')
      ) {
        res.status(409).json({ message: error.message }) // 409 Conflict
      }
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

      const { rows, count } = await this.contactoService.getAll(
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
      console.error('[ContactoController] Error en getAll:', error)
      res
        .status(500)
        .json({ message: error.message || 'Error interno del servidor.' })
    }
  }

  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID de contacto inválido.' })
      }
      const contacto = await this.contactoService.getById(id)
      res.status(200).json(contacto)
    } catch (error: any) {
      console.error('[ContactoController] Error en getById:', error)
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
        res.status(400).json({ message: 'ID de contacto inválido.' })
      }
      const data: UpdateContactoDto = req.body
      if (Object.keys(data).length === 0) {
        res
          .status(400)
          .json({ message: 'No se proporcionaron datos para actualizar.' })
      }
      const contactoActualizado = await this.contactoService.update(id, data)
      res.status(200).json(contactoActualizado)
    } catch (error: any) {
      console.error('[ContactoController] Error en update:', error)
      if (error.message.includes('no encontrado')) {
        res.status(404).json({ message: error.message })
      }
      if (
        error.message.includes('ya está en uso') ||
        error.message.includes('ya existe')
      ) {
        res.status(409).json({ message: error.message })
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
        res.status(400).json({ message: 'ID de contacto inválido.' })
      }
      await this.contactoService.delete(id)
      res.status(200).json({ message: 'Contacto eliminado correctamente.' })
    } catch (error: any) {
      console.error('[ContactoController] Error en delete:', error)
      if (error.message.includes('no encontrado')) {
        res.status(404).json({ message: error.message })
      }
      if (error.message.includes('No se puede eliminar el contacto')) {
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
        res.status(400).json({ message: 'ID de contacto inválido.' })
      }
      const contacto = await this.contactoService.toggleActivo(id)
      res.status(200).json(contacto)
    } catch (error: any) {
      console.error('[ContactoController] Error en toggleActivo:', error)
      if (error.message.includes('no encontrado')) {
        res.status(404).json({ message: error.message })
      }
      res
        .status(500)
        .json({ message: error.message || 'Error interno del servidor.' })
    }
  }
}
