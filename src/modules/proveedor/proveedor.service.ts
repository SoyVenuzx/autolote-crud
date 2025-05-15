import Proveedor from '../../models/Proveedor.model'
import Contacto from '../../models/Contacto.model' // For validation
import { CreateProveedorDto, UpdateProveedorDto } from './proveedor.dto'
import { Op } from 'sequelize'
import { Adquisicion } from '../../models/Adquisicion.model' // For checking dependencies

export class ProveedorService {
  public async create (data: CreateProveedorDto): Promise<Proveedor> {
    // Validar si contacto_id existe y no está vinculado a otro proveedor
    const contacto = await Contacto.findByPk(data.contacto_id)
    if (!contacto) {
      throw new Error(`El Contacto con ID ${data.contacto_id} no existe.`)
    }
    if (!contacto.activo) {
      throw new Error(`El Contacto con ID ${data.contacto_id} no está activo.`)
    }

    const existingProveedorByContacto = await Proveedor.findOne({
      where: { contacto_id: data.contacto_id }
    })
    if (existingProveedorByContacto) {
      throw new Error(
        `El Contacto con ID ${data.contacto_id} ya está asignado a otro proveedor (ID: ${existingProveedorByContacto.id}).`
      )
    }

    try {
      const proveedor = await Proveedor.create(data as any)
      return proveedor
    } catch (error: any) {
      console.error('Error al crear proveedor:', error)
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new Error(
          'Error de clave foránea: Asegúrese de que el contacto_id es válido.'
        )
      }
      throw new Error('Error interno al crear el proveedor.')
    }
  }

  public async getAll (
    page: number = 1,
    limit: number = 10,
    searchTerm?: string,
    activo?: string // 'true', 'false', or undefined
  ): Promise<{ rows: Proveedor[]; count: number }> {
    const offset = (page - 1) * limit
    const whereClause: any = {}

    if (activo !== undefined) {
      whereClause.activo = activo === 'true'
    }

    // Include Contacto for searching by contact details
    let includeClause = [
      {
        model: Contacto,
        as: 'contacto',
        attributes: ['nombre_completo', 'nombre_empresa', 'email', 'dni_ruc']
      }
    ]

    if (searchTerm) {
      whereClause[Op.or] = [
        { tipo_proveedor: { [Op.iLike]: `%${searchTerm}%` } },
        // Search in Contacto fields
        { '$contacto.nombre_completo$': { [Op.iLike]: `%${searchTerm}%` } },
        { '$contacto.nombre_empresa$': { [Op.iLike]: `%${searchTerm}%` } },
        { '$contacto.email$': { [Op.iLike]: `%${searchTerm}%` } },
        { '$contacto.dni_ruc$': { [Op.iLike]: `%${searchTerm}%` } }
      ]
    }

    return Proveedor.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit,
      offset,
      order: [['id', 'ASC']] // Or order by a field in Contacto if needed
    })
  }

  public async getById (id: number): Promise<Proveedor | null> {
    const proveedor = await Proveedor.findByPk(id, {
      include: [{ model: Contacto, as: 'contacto' }]
    })
    if (!proveedor) {
      throw new Error(`Proveedor con ID ${id} no encontrado.`)
    }
    return proveedor
  }

  public async update (
    id: number,
    data: UpdateProveedorDto
  ): Promise<Proveedor> {
    const proveedor = await this.getById(id)
    if (!proveedor) {
      // getById already throws, but for safety:
      throw new Error(`Proveedor con ID ${id} no encontrado para actualizar.`)
    }

    if (data.contacto_id && data.contacto_id !== proveedor.contacto_id) {
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
      const existingProveedorByContacto = await Proveedor.findOne({
        where: { contacto_id: data.contacto_id, id: { [Op.ne]: id } }
      })
      if (existingProveedorByContacto) {
        throw new Error(
          `El Contacto con ID ${data.contacto_id} ya está asignado a otro proveedor.`
        )
      }
    }

    try {
      await proveedor.update(data)
      return proveedor.reload({
        include: [{ model: Contacto, as: 'contacto' }]
      })
    } catch (error: any) {
      console.error(`Error al actualizar proveedor con ID ${id}:`, error)
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new Error(
          'Error de clave foránea: Asegúrese de que el contacto_id es válido.'
        )
      }
      throw new Error('Error interno al actualizar el proveedor.')
    }
  }

  public async delete (id: number): Promise<void> {
    const proveedor = await this.getById(id)
    if (!proveedor) {
      throw new Error(`Proveedor con ID ${id} no encontrado para eliminar.`)
    }

    // Check for dependencies before hard delete, or implement soft delete by setting 'activo' to false
    const adquisicionesAsociadas = await Adquisicion.count({
      where: { proveedor_id: id } // Assuming 'proveedor_id' is the foreign key in Adquisicion
    })

    if (adquisicionesAsociadas > 0) {
      throw new Error(
        `No se puede eliminar el proveedor ID ${id}. Tiene ${adquisicionesAsociadas} adquisición(es) asociada(s). Considere desactivarlo.`
      )
    }

    // If you prefer hard delete:
    // await proveedor.destroy();
    // For soft delete (recommended if there are dependencies or audit requirements):
    await proveedor.update({ activo: false })
  }

  public async toggleActivo (id: number): Promise<Proveedor> {
    const proveedor = await this.getById(id)
    if (!proveedor) {
      throw new Error(`Proveedor con ID ${id} no encontrado.`)
    }

    if (proveedor.activo === true) {
      // If attempting to deactivate
      // Add checks if deactivating a proveedor with active associations is not allowed
    } else {
      // If attempting to activate
      // Ensure the associated contact is active
      const contacto = await Contacto.findByPk(proveedor.contacto_id)
      if (!contacto || !contacto.activo) {
        throw new Error(
          `No se puede activar el proveedor. El contacto asociado (ID: ${proveedor.contacto_id}) no existe o no está activo.`
        )
      }
    }

    proveedor.activo = !proveedor.activo
    await proveedor.save()
    return proveedor.reload({ include: [{ model: Contacto, as: 'contacto' }] })
  }
}
