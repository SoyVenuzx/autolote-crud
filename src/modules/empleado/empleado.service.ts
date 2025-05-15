// src/modules/empleado/empleado.service.ts
import Empleado from '../../models/Empleado.model'
import Contacto from '../../models/Contacto.model'
import Puesto from '../../models/Puesto.model'
import { CreateEmpleadoDto, UpdateEmpleadoDto } from './empleado.dto'
import { Op } from 'sequelize'
import { Venta } from '../../models/Venta.model' // For checking dependencies (as vendedor)
import { Adquisicion } from '../../models/Adquisicion.model' // For checking dependencies (as empleado_registra)

export class EmpleadoService {
  private async getEmpleadosList (
    page: number = 1,
    limit: number = 10,
    searchTerm?: string,
    activo?: string,
    puestoId?: number
  ): Promise<{ rows: Empleado[]; count: number }> {
    const offset = (page - 1) * limit
    const whereClause: any = {}

    if (activo !== undefined) {
      whereClause.activo = activo === 'true'
    }
    if (puestoId) {
      whereClause.puesto_id = puestoId
    }

    const includeClause = [
      {
        model: Contacto,
        as: 'contacto',
        attributes: ['nombre_completo', 'email', 'dni_ruc']
      },
      {
        model: Puesto,
        as: 'puesto',
        attributes: ['nombre_puesto']
      }
    ]

    if (searchTerm) {
      whereClause[Op.or] = [
        { '$contacto.nombre_completo$': { [Op.iLike]: `%${searchTerm}%` } },
        { '$contacto.email$': { [Op.iLike]: `%${searchTerm}%` } },
        { '$contacto.dni_ruc$': { [Op.iLike]: `%${searchTerm}%` } },
        { '$puesto.nombre_puesto$': { [Op.iLike]: `%${searchTerm}%` } }
      ]
    }

    return Empleado.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit,
      offset,
      order: [['id', 'ASC']]
    })
  }
  public async create (
    data: CreateEmpleadoDto
  ): Promise<{ rows: Empleado[]; count: number }> {
    // Validate contacto_id
    const contacto = await Contacto.findByPk(data.contacto_id)
    if (!contacto) {
      throw new Error(`El Contacto con ID ${data.contacto_id} no existe.`)
    }
    if (!contacto.activo) {
      throw new Error(`El Contacto con ID ${data.contacto_id} no está activo.`)
    }
    const existingEmpleadoByContacto = await Empleado.findOne({
      where: { contacto_id: data.contacto_id }
    })
    if (existingEmpleadoByContacto && existingEmpleadoByContacto.activo) {
      throw new Error(
        `El Contacto con ID ${data.contacto_id} ya está asignado a otro empleado (ID: ${existingEmpleadoByContacto.id}).`
      )
    }

    // Validate puesto_id
    const puesto = await Puesto.findByPk(data.puesto_id)
    if (!puesto) {
      throw new Error(`El Puesto con ID ${data.puesto_id} no existe.`)
    }
    if (!puesto.activo) {
      throw new Error(
        `El Puesto con ID ${data.puesto_id} no está activo. No se puede asignar a un empleado.`
      )
    }

    if (
      data.fecha_desvinculacion &&
      data.fecha_contratacion &&
      new Date(data.fecha_desvinculacion) < new Date(data.fecha_contratacion)
    ) {
      throw new Error(
        'La fecha de desvinculación no puede ser anterior a la fecha de contratación.'
      )
    }

    // Si no existe fecha_contratacion, asignar la fecha actual
    if (!data.fecha_contratacion) {
      data.fecha_contratacion = new Date()
    } else {
      // Convertir fecha_contratacion a Date si es un string
      if (typeof data.fecha_contratacion === 'string') {
        data.fecha_contratacion = new Date(data.fecha_contratacion)
      }
    }

    try {
      await Empleado.create(data as any)

      return this.getEmpleadosList()
    } catch (error: any) {
      console.error('Error al crear empleado:', error)
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        const field =
          error.fields && error.fields.length > 0
            ? error.fields.join(', ')
            : 'desconocido'
        throw new Error(
          `Error de clave foránea en el campo ${field}. Asegúrese de que los IDs de contacto y puesto son válidos.`
        )
      }
      throw new Error('Error interno al crear el empleado.')
    }
  }

  public async getAll (
    page: number = 1,
    limit: number = 10,
    searchTerm?: string,
    activo?: string,
    puestoId?: number
  ): Promise<{ rows: Empleado[]; count: number }> {
    return this.getEmpleadosList(page, limit, searchTerm, activo, puestoId)
  }

  public async getById (id: number): Promise<Empleado | null> {
    const empleado = await Empleado.findByPk(id, {
      include: [
        { model: Contacto, as: 'contacto' },
        { model: Puesto, as: 'puesto' }
      ]
    })
    if (!empleado) {
      throw new Error(`Empleado con ID ${id} no encontrado.`)
    }
    return empleado
  }

  public async update (id: number, data: UpdateEmpleadoDto): Promise<Empleado> {
    const empleado = await this.getById(id)
    if (!empleado) {
      throw new Error(`Empleado con ID ${id} no encontrado para actualizar.`)
    }

    if (data.contacto_id && data.contacto_id !== empleado.contacto_id) {
      const contacto = await Contacto.findByPk(data.contacto_id)
      if (!contacto) {
        throw new Error(
          `El nuevo Contacto con ID ${data.contacto_id} no existe.`
        )
      }
      if (!contacto.activo) {
        throw new Error(
          `El nuevo Contacto con ID ${data.contacto_id} no está activo.`
        )
      }
      const existingEmpleadoByContacto = await Empleado.findOne({
        where: { contacto_id: data.contacto_id, id: { [Op.ne]: id } }
      })
      if (existingEmpleadoByContacto) {
        throw new Error(
          `El Contacto con ID ${data.contacto_id} ya está asignado a otro empleado.`
        )
      }
    }

    if (data.puesto_id && data.puesto_id !== empleado.puesto_id) {
      const puesto = await Puesto.findByPk(data.puesto_id)
      if (!puesto) {
        throw new Error(`El nuevo Puesto con ID ${data.puesto_id} no existe.`)
      }
      if (!puesto.activo) {
        throw new Error(
          `El Puesto con ID ${data.puesto_id} no está activo. No se puede asignar a un empleado.`
        )
      }
    }

    const fechaContratacion = data.fecha_contratacion
      ? new Date(data.fecha_contratacion)
      : empleado.fecha_contratacion
    const fechaDesvinculacion = data.fecha_desvinculacion
      ? new Date(data.fecha_desvinculacion)
      : empleado.fecha_desvinculacion

    if (
      fechaDesvinculacion &&
      fechaContratacion &&
      fechaDesvinculacion < fechaContratacion
    ) {
      throw new Error(
        'La fecha de desvinculación no puede ser anterior a la fecha de contratación.'
      )
    }

    // If fecha_desvinculacion is provided, employee should be inactive
    if (data.fecha_desvinculacion !== undefined) {
      // Check if it's part of the update
      if (data.fecha_desvinculacion === null) {
        // Explicitly clearing desvinculacion
        if (data.activo === undefined) data.activo = true // If not specified, reactivate
      } else {
        data.activo = false // If desvinculacion date is set, make inactive
      }
    }

    try {
      await empleado.update(data)
      return empleado.reload({
        include: [
          { model: Contacto, as: 'contacto' },
          { model: Puesto, as: 'puesto' }
        ]
      })
    } catch (error: any) {
      console.error(`Error al actualizar empleado con ID ${id}:`, error)
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        const field =
          error.fields && error.fields.length > 0
            ? error.fields.join(', ')
            : 'desconocido'
        throw new Error(
          `Error de clave foránea en el campo ${field}. Asegúrese de que los IDs son válidos.`
        )
      }
      throw new Error('Error interno al actualizar el empleado.')
    }
  }

  public async delete (
    id: number
  ): Promise<{ rows: Empleado[]; count: number }> {
    const empleado = await this.getById(id)
    if (!empleado) {
      throw new Error(`Empleado con ID ${id} no encontrado para eliminar.`)
    }

    // Check dependencies before "deleting" (making inactive)
    // Example: if employee is a 'vendedor' in 'Venta' or 'empleado_registra' in 'Adquisicion'
    const ventasAsociadas = await Venta.count({ where: { vendedor_id: id } })
    if (ventasAsociadas > 0) {
      throw new Error(
        `No se puede eliminar/desactivar el empleado ID ${id}. Está asociado a ${ventasAsociadas} venta(s). Considere reasignarlas.`
      )
    }

    const adquisicionesRegistradas = await Adquisicion.count({
      where: { empleado_registra_id: id }
    })
    if (adquisicionesRegistradas > 0) {
      throw new Error(
        `No se puede eliminar/desactivar el empleado ID ${id}. Ha registrado ${adquisicionesRegistradas} adquisición(es).`
      )
    }

    // Soft delete by setting 'activo' to false and adding 'fecha_desvinculacion'
    // await empleado.update({ activo: false, fecha_desvinculacion: new Date() })
    await empleado.destroy()
    return this.getEmpleadosList()
  }

  public async toggleActivo (id: number): Promise<Empleado> {
    const empleado = await this.getById(id)
    if (!empleado) {
      throw new Error(`Empleado con ID ${id} no encontrado.`)
    }

    if (empleado.activo === true) {
      // Attempting to deactivate
      // Add dependency checks similar to delete if needed
      const ventasAsociadas = await Venta.count({
        where: { vendedor_id: id /* add other conditions like active sales */ }
      })
      if (ventasAsociadas > 0) {
        throw new Error(
          `No se puede desactivar el empleado ID ${id}. Está asociado a ${ventasAsociadas} venta(s) activa(s). Considere reasignarlas primero.`
        )
      }
      const adquisicionesRegistradas = await Adquisicion.count({
        where: { empleado_registra_id: id }
      })
      if (adquisicionesRegistradas > 0) {
        // Depending on business logic, this might be a warning or a blocker
        // For now, let's consider it a blocker if there are any.
        throw new Error(
          `No se puede desactivar el empleado ID ${id}. Ha registrado ${adquisicionesRegistradas} adquisición(es).`
        )
      }

      empleado.activo = false
      empleado.fecha_desvinculacion = new Date()
    } else {
      // Attempting to activate
      const contacto = await Contacto.findByPk(empleado.contacto_id)
      if (!contacto || !contacto.activo) {
        throw new Error(
          `No se puede activar el empleado. El contacto asociado (ID: ${empleado.contacto_id}) no existe o no está activo.`
        )
      }
      const puesto = await Puesto.findByPk(empleado.puesto_id)
      if (!puesto || !puesto.activo) {
        throw new Error(
          `No se puede activar el empleado. El puesto asociado (ID: ${empleado.puesto_id}) no existe o no está activo.`
        )
      }
      empleado.activo = true
      empleado.fecha_desvinculacion = undefined // Clear desvinculacion date
    }

    await empleado.save()
    return empleado.reload({
      include: [
        { model: Contacto, as: 'contacto' },
        { model: Puesto, as: 'puesto' }
      ]
    })
  }
}
