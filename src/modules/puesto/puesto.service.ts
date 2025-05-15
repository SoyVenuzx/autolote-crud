// src/modules/puesto/puesto.service.ts
import Puesto from '../../models/Puesto.model'
import { CreatePuestoDto, UpdatePuestoDto } from './puesto.dto'
import { Op } from 'sequelize'
import Empleado from '../../models/Empleado.model' // Para verificar dependencias

export class PuestoService {
  public async create (data: CreatePuestoDto): Promise<Puesto> {
    const existing = await Puesto.findOne({
      where: { nombre_puesto: data.nombre_puesto }
    })
    if (existing) {
      throw new Error(`El puesto '${data.nombre_puesto}' ya existe.`)
    }
    try {
      return Puesto.create(data as any)
    } catch (error: any) {
      console.error('Error al crear puesto:', error)
      throw new Error('Error interno al crear el puesto.')
    }
  }

  public async getAll (
    page: number = 1,
    limit: number = 10,
    searchTerm?: string,
    activo?: string
  ): Promise<{ rows: Puesto[]; count: number }> {
    const offset = (page - 1) * limit
    const whereClause: any = {}

    if (searchTerm) {
      whereClause.nombre_puesto = { [Op.iLike]: `%${searchTerm}%` }
    }
    if (activo !== undefined) {
      whereClause.activo = activo === 'true'
    }

    return Puesto.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['nombre_puesto', 'ASC']]
    })
  }

  public async getById (id: number): Promise<Puesto | null> {
    const puesto = await Puesto.findByPk(id)
    if (!puesto) {
      throw new Error(`Puesto con ID ${id} no encontrado.`)
    }
    return puesto
  }

  public async update (id: number, data: UpdatePuestoDto): Promise<Puesto> {
    const puesto = await this.getById(id)
    if (!puesto) {
      throw new Error(`Puesto con ID ${id} no encontrado para actualizar.`)
    }

    if (data.nombre_puesto && data.nombre_puesto !== puesto.nombre_puesto) {
      const existing = await Puesto.findOne({
        where: { nombre_puesto: data.nombre_puesto, id: { [Op.ne]: id } }
      })
      if (existing) {
        throw new Error(
          `El nombre de puesto '${data.nombre_puesto}' ya está en uso.`
        )
      }
    }
    try {
      await puesto.update(data)
      return puesto.reload()
    } catch (error: any) {
      console.error(`Error al actualizar puesto con ID ${id}:`, error)
      throw new Error('Error interno al actualizar el puesto.')
    }
  }

  public async delete (id: number): Promise<void> {
    const puesto = await this.getById(id)
    if (!puesto) {
      throw new Error(`Puesto con ID ${id} no encontrado para eliminar.`)
    }

    // Verificar si hay empleados asociados a este puesto
    const empleadosAsociados = await Empleado.count({
      where: { puesto_id: id, activo: true }
    })
    if (empleadosAsociados > 0) {
      throw new Error(
        `No se puede eliminar el puesto. Existen ${empleadosAsociados} empleado(s) activo(s) asignado(s) a él. Considere desactivarlo o reasignar los empleados.`
      )
    }
    try {
      await puesto.destroy()
    } catch (error: any) {
      console.error(`Error al eliminar puesto con ID ${id}:`, error)
      throw new Error('Error interno al eliminar el puesto.')
    }
  }

  public async toggleActivo (id: number): Promise<Puesto> {
    const puesto = await this.getById(id)
    if (!puesto) {
      throw new Error(`Puesto con ID ${id} no encontrado.`)
    }
    // Si se va a desactivar, verificar empleados activos.
    if (puesto.activo === true) {
      // Se va a desactivar
      const empleadosAsociados = await Empleado.count({
        where: { puesto_id: id, activo: true }
      })
      if (empleadosAsociados > 0) {
        throw new Error(
          `No se puede desactivar el puesto. Existen ${empleadosAsociados} empleado(s) activo(s) asignado(s) a él. Reasigne los empleados primero.`
        )
      }
    }
    puesto.activo = !puesto.activo
    await puesto.save()
    return puesto
  }
}
