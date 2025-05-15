// src/modules/vehiculo/vehiculo.controller.ts
import { Request, Response, NextFunction } from 'express'
import { VehiculoService } from './vehiculo.service'
import { CreateVehiculoDto, UpdateVehiculoDto } from './vehiculo.dto'
import { EstadoInventario } from '../../models/Vehiculo.model' // Importar el tipo

export class VehiculoController {
  private vehiculoService: VehiculoService

  constructor () {
    this.vehiculoService = new VehiculoService()
  }

  private handleServiceError (res: Response, error: any, defaultStatus = 500) {
    console.error(`[VehiculoController] Error:`, error)
    if (error instanceof Error) {
      if (
        error.message.includes('no existe') ||
        error.message.includes('no encontrado')
      ) {
        res.status(404).json({ message: error.message })
        return
      }
      if (
        error.message.includes('ya está en uso') ||
        error.message.includes('ya existe') ||
        error.message.includes('Faltan campos obligatorios') ||
        error.message.startsWith('Error en el servicio')
      ) {
        res.status(400).json({ message: error.message })
        return
      }
      if (error.message.includes('ya ha sido vendido')) {
        res.status(409).json({ message: error.message }) // 409 Conflict
        return
      }
    }
    res
      .status(defaultStatus)
      .json({ message: error.message || 'Error interno del servidor.' })
  }

  public create = async (req: Request, res: Response, next: NextFunction) => {
    const vehiculoData: CreateVehiculoDto = req.body

    if (
      !vehiculoData.modelo_id ||
      !vehiculoData.color_id ||
      !vehiculoData.tipo_transmision_id ||
      !vehiculoData.tipo_combustible_id ||
      !vehiculoData.anio ||
      !vehiculoData.vin ||
      vehiculoData.precio_base === undefined || // Puede ser 0
      !vehiculoData.adquisicion ||
      !vehiculoData.adquisicion.fecha_adquisicion ||
      vehiculoData.adquisicion.costo_adquisicion === undefined || // Puede ser 0
      !vehiculoData.adquisicion.tipo_adquisicion
    ) {
      res.status(400).json({
        message:
          'Faltan campos obligatorios para crear el vehículo y su adquisición. Verifique modelo, color, transmisión, combustible, año, VIN, precio base y datos de adquisición.'
      })
    }

    try {
      const nuevoVehiculo = await this.vehiculoService.createVehiculo(
        vehiculoData
      )
      res.status(201).json(nuevoVehiculo)
    } catch (error) {
      this.handleServiceError(res, error)
    }
  }

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const searchTerm = req.query.searchTerm as string | undefined
      const estado = req.query.estado as EstadoInventario | undefined
      const parseQueryParam = (param: string | undefined) =>
        param ? parseInt(param) : undefined

      const marcaId = parseQueryParam(req.query.marcaId as string | undefined)
      const modeloId = parseQueryParam(req.query.modeloId as string | undefined)
      const anio = parseQueryParam(req.query.anio as string | undefined)
      const colorId = parseQueryParam(req.query.colorId as string | undefined)
      const tipoCombustibleId = parseQueryParam(
        req.query.tipoCombustibleId as string | undefined
      )
      const tipoTransmisionId = parseQueryParam(
        req.query.tipoTransmisionId as string | undefined
      )

      const { rows, count } = await this.vehiculoService.getAllVehiculos(
        page,
        limit,
        searchTerm,
        estado,
        marcaId,
        modeloId,
        anio,
        colorId,
        tipoCombustibleId,
        tipoTransmisionId
      )
      res.status(200).json({
        data: rows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      })
    } catch (error) {
      this.handleServiceError(res, error)
    }
  }

  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID de vehículo inválido.' })
      }
      const vehiculo = await this.vehiculoService.getVehiculoById(id)
      res.status(200).json(vehiculo)
    } catch (error) {
      this.handleServiceError(res, error)
    }
  }

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID de vehículo inválido.' })
      }
      const data: UpdateVehiculoDto = req.body
      if (Object.keys(data).length === 0) {
        res
          .status(400)
          .json({ message: 'No se proporcionaron datos para actualizar.' })
      }
      const vehiculoActualizado = await this.vehiculoService.updateVehiculo(
        id,
        data
      )
      res.status(200).json(vehiculoActualizado)
    } catch (error) {
      this.handleServiceError(res, error)
    }
  }

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID de vehículo inválido.' })
      }
      await this.vehiculoService.deleteVehiculo(id)
      res.status(200).json({
        message: 'Vehículo marcado como "No Disponible" correctamente.'
      }) // Cambiado para reflejar soft delete
    } catch (error) {
      this.handleServiceError(res, error)
    }
  }
}
