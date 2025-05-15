// src/modules/vehiculo/vehiculo.service.ts
import sequelize from '../../config/db'
import Vehiculo, { EstadoInventario } from '../../models/Vehiculo.model'
import Adquisicion from '../../models/Adquisicion.model'
// import ImagenVehiculo from '../../models/ImagenVehiculo.model'; // Comentado según requerimiento
import VehiculoCaracteristicaOpcional from '../../models/VehiculoCaracteristicaOpcional.model'
import {
  CreateVehiculoDto,
  CreateAdquisicionDto,
  UpdateVehiculoDto,
  UpdateAdquisicionDto,
  UpdateVehiculoCaracteristicaOpcionalDto
  // CreateImagenVehiculoDto, // Comentado según requerimiento
} from './vehiculo.dto'
import Modelo from '../../models/Modelo.model'
import Color from '../../models/Color.model'
import TipoTransmision from '../../models/TipoTransmision.model'
import TipoCombustible from '../../models/TipoCombustible.model'
import CaracteristicaOpcional from '../../models/CaracteristicaOpcional.model'
import Marca from '../../models/Marca.model' // Necesario para incluir en la respuesta
import { Op } from 'sequelize'

export class VehiculoService {
  private async validateForeignKeys (
    data: Partial<CreateVehiculoDto | UpdateVehiculoDto>,
    transaction?: any
  ): Promise<void> {
    if (data.modelo_id) {
      const modeloExists = await Modelo.findByPk(data.modelo_id, {
        transaction
      })
      if (!modeloExists) {
        throw new Error(`El modelo con ID ${data.modelo_id} no existe.`)
      }
    }
    if (data.color_id) {
      const colorExists = await Color.findByPk(data.color_id, { transaction })
      if (!colorExists) {
        throw new Error(`El color con ID ${data.color_id} no existe.`)
      }
    }
    if (data.tipo_transmision_id) {
      const tipoTransmisionExists = await TipoTransmision.findByPk(
        data.tipo_transmision_id,
        { transaction }
      )
      if (!tipoTransmisionExists) {
        throw new Error(
          `El tipo de transmisión con ID ${data.tipo_transmision_id} no existe.`
        )
      }
    }
    if (data.tipo_combustible_id) {
      const tipoCombustibleExists = await TipoCombustible.findByPk(
        data.tipo_combustible_id,
        { transaction }
      )
      if (!tipoCombustibleExists) {
        throw new Error(
          `El tipo de combustible con ID ${data.tipo_combustible_id} no existe.`
        )
      }
    }
  }

  private getVehiculoIncludes () {
    return [
      {
        model: Modelo,
        include: [Marca] // Incluir Marca a través de Modelo
      },
      Color,
      TipoTransmision,
      TipoCombustible,
      Adquisicion,
      // { model: ImagenVehiculo, as: 'imagenes' }, // Comentado según requerimiento
      {
        model: CaracteristicaOpcional,
        as: 'caracteristicas',
        through: { attributes: ['valor_caracteristica'] }
      }
    ]
  }

  public async createVehiculo (data: CreateVehiculoDto): Promise<Vehiculo> {
    const transaction = await sequelize.transaction()
    try {
      await this.validateForeignKeys(data, transaction)

      const vehiculo = await Vehiculo.create(
        {
          ...data,
          estado_inventario: data.estado_inventario || 'En Preparacion'
        },
        { transaction }
      )

      const adquisicionData = {
        ...(data.adquisicion as CreateAdquisicionDto),
        vehiculo_id: vehiculo.id
      }
      await Adquisicion.create(adquisicionData, { transaction })

      if (
        data.caracteristicasOpcionales &&
        data.caracteristicasOpcionales.length > 0
      ) {
        for (const carac of data.caracteristicasOpcionales) {
          const caracteristicaExists = await CaracteristicaOpcional.findByPk(
            carac.caracteristica_id,
            { transaction }
          )
          if (!caracteristicaExists) {
            console.warn(
              `La característica opcional con ID ${carac.caracteristica_id} no existe y será omitida.`
            )
            continue
          }
          await VehiculoCaracteristicaOpcional.create(
            {
              vehiculo_id: vehiculo.id,
              caracteristica_id: carac.caracteristica_id,
              valor_caracteristica: carac.valor_caracteristica
            },
            { transaction }
          )
        }
      }

      await transaction.commit()
      const vehiculoCompleto = await Vehiculo.findByPk(vehiculo.id, {
        include: this.getVehiculoIncludes()
      })
      if (!vehiculoCompleto) {
        throw new Error(
          `El vehículo con ID ${vehiculo.id} no se encontró después de crearlo.`
        )
      }
      return vehiculoCompleto
    } catch (error) {
      await transaction.rollback()
      console.error('Error al crear el vehículo:', error)
      if (error instanceof Error) {
        throw new Error(
          `Error en el servicio al crear vehículo: ${error.message}`
        )
      }
      throw new Error('Ocurrió un error desconocido al crear el vehículo.')
    }
  }

  // http://localhost:3000/api/vehiculos?page=1&limit=10&estado=Disponible&marcaId=3
  public async getAllVehiculos (
    page: number = 1,
    limit: number = 10,
    searchTerm?: string,
    estado?: EstadoInventario,
    marcaId?: number,
    modeloId?: number,
    anio?: number,
    colorId?: number,
    tipoCombustibleId?: number,
    tipoTransmisionId?: number
  ): Promise<{ rows: Vehiculo[]; count: number }> {
    const offset = (page - 1) * limit
    const whereClause: any = {}
    const includeClause = this.getVehiculoIncludes()

    if (searchTerm) {
      whereClause[Op.or] = [
        { vin: { [Op.iLike]: `%${searchTerm}%` } },
        { numero_motor: { [Op.iLike]: `%${searchTerm}%` } },
        { numero_chasis: { [Op.iLike]: `%${searchTerm}%` } },
        { '$modelo.nombre_modelo$': { [Op.iLike]: `%${searchTerm}%` } },
        { '$modelo.marca.nombre_marca$': { [Op.iLike]: `%${searchTerm}%` } }
      ]
    }

    const filters = {
      estado_inventario: estado,
      anio,
      color_id: colorId,
      tipo_combustible_id: tipoCombustibleId,
      tipo_transmision_id: tipoTransmisionId
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        whereClause[key] = value
      }
    })

    if (modeloId) {
      whereClause.modelo_id = modeloId
    } else if (marcaId) {
      // Si marcaId está presente pero modeloId no, filtramos por marcaId a través del modelo
      const modelosDeMarca = await Modelo.findAll({
        where: { marca_id: marcaId },
        attributes: ['id'],
        raw: true
      })
      const modeloIds = modelosDeMarca.map(m => m.id)
      if (modeloIds.length > 0) {
        whereClause.modelo_id = { [Op.in]: modeloIds }
      } else {
        // Si no hay modelos para esa marca, no habrá resultados.
        // Devolvemos un conjunto vacío para evitar errores.
        return { rows: [], count: 0 }
      }
    }

    return Vehiculo.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit,
      offset,
      order: [['fecha_ingreso_sistema', 'DESC']],
      distinct: true // Necesario cuando se usa include con limit y hay HasMany/BelongsToMany
    })
  }

  public async getVehiculoById (id: number): Promise<Vehiculo | null> {
    const vehiculo = await Vehiculo.findByPk(id, {
      include: this.getVehiculoIncludes()
    })
    if (!vehiculo) {
      throw new Error(`Vehículo con ID ${id} no encontrado.`)
    }
    return vehiculo
  }

  public async updateVehiculo (
    id: number,
    data: UpdateVehiculoDto
  ): Promise<Vehiculo> {
    const transaction = await sequelize.transaction()
    try {
      const vehiculo = await Vehiculo.findByPk(id, {
        include: [Adquisicion, CaracteristicaOpcional], // Incluir para poder actualizar/eliminar
        transaction
      })

      if (!vehiculo) {
        throw new Error(`Vehículo con ID ${id} no encontrado para actualizar.`)
      }

      await this.validateForeignKeys(data, transaction)

      // 1. Actualizar datos del Vehículo
      await vehiculo.update(data, { transaction })

      // 2. Actualizar Adquisición asociada (si se proporciona)
      if (data.adquisicion) {
        const adquisicion = await Adquisicion.findOne({
          where: { vehiculo_id: id },
          transaction
        })
        if (adquisicion) {
          await adquisicion.update(data.adquisicion, { transaction })
        } else {
          // Esto no debería pasar si la adquisición es obligatoria, pero por si acaso
          const newAdquisicionData = {
            ...data.adquisicion,
            vehiculo_id: id
          } as CreateAdquisicionDto
          if (
            !newAdquisicionData.fecha_adquisicion ||
            newAdquisicionData.costo_adquisicion === undefined ||
            !newAdquisicionData.tipo_adquisicion
          ) {
            throw new Error(
              'Faltan campos obligatorios para crear la adquisición asociada.'
            )
          }
          await Adquisicion.create(
            newAdquisicionData as any, // Cast porque CreateAdquisicionDto es más estricto
            { transaction }
          )
        }
      }

      // 3. Actualizar Características Opcionales (si se proporcionan)
      if (data.caracteristicasOpcionales) {
        // Estrategia: Eliminar las existentes que no están en la nueva lista o marcadas para destruir,
        // actualizar las que tienen ID, y crear las nuevas.
        const currentCaracteristicasIds = vehiculo.caracteristicas
          ? vehiculo.caracteristicas.map(
              (c: any) => c.VehiculoCaracteristicaOpcional.caracteristica_id
            )
          : []
        const incomingCaracteristicas = data.caracteristicasOpcionales || []

        // Eliminar las que ya no vienen o están marcadas con _destroy: true
        const caracteristicasAEliminar =
          await VehiculoCaracteristicaOpcional.findAll({
            where: {
              vehiculo_id: id,
              caracteristica_id: {
                [Op.notIn]: incomingCaracteristicas
                  .filter(c => !c._destroy && c.caracteristica_id)
                  .map(c => c.caracteristica_id)
              }
            },
            transaction
          })

        for (const carac of incomingCaracteristicas.filter(
          c => c._destroy && c.id
        )) {
          const existing = await VehiculoCaracteristicaOpcional.findOne({
            where: {
              vehiculo_id: id,
              caracteristica_id: carac.caracteristica_id
            },
            transaction
          })
          if (existing) caracteristicasAEliminar.push(existing)
        }

        for (const vc of caracteristicasAEliminar) {
          await vc.destroy({ transaction })
        }

        // Actualizar o Crear
        for (const caracDto of incomingCaracteristicas.filter(
          c => !c._destroy
        )) {
          const caracteristicaExists = await CaracteristicaOpcional.findByPk(
            caracDto.caracteristica_id,
            { transaction }
          )
          if (!caracteristicaExists) {
            console.warn(
              `La característica opcional con ID ${caracDto.caracteristica_id} no existe y será omitida.`
            )
            continue
          }

          const existingVCO = await VehiculoCaracteristicaOpcional.findOne({
            where: {
              vehiculo_id: id,
              caracteristica_id: caracDto.caracteristica_id
            },
            transaction
          })

          if (existingVCO) {
            // Actualizar
            await existingVCO.update(
              { valor_caracteristica: caracDto.valor_caracteristica },
              { transaction }
            )
          } else {
            // Crear nueva asociación
            await VehiculoCaracteristicaOpcional.create(
              {
                vehiculo_id: id,
                caracteristica_id: caracDto.caracteristica_id,
                valor_caracteristica: caracDto.valor_caracteristica
              },
              { transaction }
            )
          }
        }
      }

      await transaction.commit()
      return (await this.getVehiculoById(id))! // Recargar con todas las asociaciones
    } catch (error) {
      await transaction.rollback()
      console.error(`Error al actualizar vehículo con ID ${id}:`, error)
      if (error instanceof Error) {
        throw new Error(
          `Error en el servicio al actualizar vehículo: ${error.message}`
        )
      }
      throw new Error('Ocurrió un error desconocido al actualizar el vehículo.')
    }
  }

  public async deleteVehiculo (id: number): Promise<void> {
    const transaction = await sequelize.transaction()
    try {
      const vehiculo = await Vehiculo.findByPk(id, { transaction })
      if (!vehiculo) {
        throw new Error(`Vehículo con ID ${id} no encontrado para eliminar.`)
      }

      // Lógica de "soft delete": Cambiar estado a 'No Disponible' o similar.
      // O podrías añadir un campo `activo: boolean` al modelo Vehiculo.
      // Por ahora, lo marcamos como 'No Disponible'.
      // Futuro: verificar si está en una Venta activa, etc.
      if (vehiculo.estado_inventario === 'Vendido') {
        throw new Error(
          `El vehículo con ID ${id} ya ha sido vendido y no puede ser eliminado/desactivado de esta forma.`
        )
      }

      await vehiculo.update(
        { estado_inventario: 'No Disponible' },
        { transaction }
      )
      // No eliminamos la adquisición ni las características, ya que es un soft delete del vehículo.

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      console.error(`Error al eliminar vehículo con ID ${id}:`, error)
      if (error instanceof Error) {
        throw new Error(
          `Error en el servicio al eliminar vehículo: ${error.message}`
        )
      }
      throw new Error('Ocurrió un error desconocido al eliminar el vehículo.')
    }
  }
}
