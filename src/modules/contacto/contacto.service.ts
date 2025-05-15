import Contacto from '../../models/Contacto.model'
import { CreateContactoDto, UpdateContactoDto } from './contacto.dto'
import sequelize from '../../config/db' // Ajusta la ruta si es necesario
import { Op } from 'sequelize'
import Cliente from '@/models/Cliente.model'
import Empleado from '@/models/Empleado.model'
import Proveedor from '@/models/Proveedor.model'

export class ContactoService {
  public async create (data: CreateContactoDto): Promise<Contacto> {
    // Validación de unicidad para email si se proporciona
    if (data.email) {
      const existingByEmail = await Contacto.findOne({
        where: { email: data.email }
      })
      if (existingByEmail) {
        throw new Error(`El email '${data.email}' ya está en uso.`)
      }
    }
    // Validación de unicidad para dni_ruc si se proporciona
    if (data.dni_ruc) {
      const existingByDniRuc = await Contacto.findOne({
        where: { dni_ruc: data.dni_ruc }
      })
      if (existingByDniRuc) {
        throw new Error(`El DNI/RUC '${data.dni_ruc}' ya está en uso.`)
      }
    }

    try {
      const contacto = await Contacto.create(data as any)
      return contacto
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        // Asumiendo que tienes índices únicos definidos en el modelo para email y/o dni_ruc
        const field = error.errors[0]?.path
        const value = error.errors[0]?.value
        throw new Error(`El campo '${field}' con valor '${value}' ya existe.`)
      }
      console.error('Error al crear contacto:', error)
      throw new Error('Error interno al crear el contacto.')
    }
  }

  public async getAll (
    page: number = 1,
    limit: number = 10,
    searchTerm?: string,
    activo?: string // 'true', 'false', o undefined
  ): Promise<{ rows: Contacto[]; count: number }> {
    const offset = (page - 1) * limit
    const whereClause: any = {}

    if (searchTerm) {
      whereClause[Op.or] = [
        { nombre_completo: { [Op.iLike]: `%${searchTerm}%` } },
        { nombre_empresa: { [Op.iLike]: `%${searchTerm}%` } },
        { email: { [Op.iLike]: `%${searchTerm}%` } },
        { dni_ruc: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    }

    if (activo !== undefined) {
      whereClause.activo = activo === 'true'
    }

    return Contacto.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['nombre_completo', 'ASC']]
    })
  }

  public async getById (id: number): Promise<Contacto | null> {
    const contacto = await Contacto.findByPk(id)
    if (!contacto) {
      throw new Error(`Contacto con ID ${id} no encontrado.`)
    }
    return contacto
  }

  public async update (id: number, data: UpdateContactoDto): Promise<Contacto> {
    const contacto = await this.getById(id) // Reutiliza getById para verificar existencia
    if (!contacto) {
      throw new Error(`Contacto con ID ${id} no encontrado para actualizar.`)
    }

    // Validación de unicidad para email si se cambia y se proporciona
    if (data.email && data.email !== contacto.email) {
      const existingByEmail = await Contacto.findOne({
        where: { email: data.email, id: { [Op.ne]: id } }
      })
      if (existingByEmail) {
        throw new Error(
          `El email '${data.email}' ya está en uso por otro contacto.`
        )
      }
    }
    // Validación de unicidad para dni_ruc si se cambia y se proporciona
    if (data.dni_ruc && data.dni_ruc !== contacto.dni_ruc) {
      const existingByDniRuc = await Contacto.findOne({
        where: { dni_ruc: data.dni_ruc, id: { [Op.ne]: id } }
      })
      if (existingByDniRuc) {
        throw new Error(
          `El DNI/RUC '${data.dni_ruc}' ya está en uso por otro contacto.`
        )
      }
    }

    try {
      await contacto.update(data)
      return contacto.reload() // Recargar para obtener los datos actualizados
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0]?.path
        const value = error.errors[0]?.value
        throw new Error(`El campo '${field}' con valor '${value}' ya existe.`)
      }
      console.error(`Error al actualizar contacto con ID ${id}:`, error)
      throw new Error('Error interno al actualizar el contacto.')
    }
  }

  public async delete (id: number): Promise<void> {
    const contacto = await this.getById(id)
    if (!contacto) {
      throw new Error(`Contacto con ID ${id} no encontrado para eliminar.`)
    }

    try {
      // Verificar si el contacto está siendo usado por Cliente, Empleado o Proveedor
      // Esta es una verificación importante antes de permitir la eliminación lógica.
      const clienteAsociado = await Cliente.findOne({
        where: { contacto_id: id }
      })
      if (clienteAsociado) {
        throw new Error(
          `No se puede eliminar el contacto. Está asociado al cliente ID ${clienteAsociado.id}. Considere desactivarlo.`
        )
      }

      const empleadoAsociado = await Empleado.findOne({
        where: { contacto_id: id }
      })
      if (empleadoAsociado) {
        throw new Error(
          `No se puede eliminar el contacto. Está asociado al empleado ID ${empleadoAsociado.id}. Considere desactivarlo.`
        )
      }

      const proveedorAsociado = await Proveedor.findOne({
        where: { contacto_id: id }
      })
      if (proveedorAsociado) {
        throw new Error(
          `No se puede eliminar el contacto. Está asociado al proveedor ID ${proveedorAsociado.id}. Considere desactivarlo.`
        )
      }

      // await contacto.destroy()
      await contacto.update({ activo: false })
    } catch (error: any) {
      console.error(`Error al eliminar contacto con ID ${id}:`, error)
      if (error.message.includes('No se puede eliminar el contacto')) {
        throw error // Relanzar error específico
      }
      throw new Error('Error interno al eliminar el contacto.')
    }
  }

  public async toggleActivo (id: number): Promise<Contacto> {
    const contacto = await this.getById(id)
    if (!contacto) {
      throw new Error(`Contacto con ID ${id} no encontrado.`)
    }
    contacto.activo = !contacto.activo
    await contacto.save()
    return contacto
  }
}
