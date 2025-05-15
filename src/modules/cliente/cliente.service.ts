import Cliente from '../../models/Cliente.model'
import Contacto from '../../models/Contacto.model' // For validation
import { CreateClienteDto, UpdateClienteDto } from './cliente.dto'
import { Op } from 'sequelize'
import { Venta } from '../../models/Venta.model' // For checking dependencies
import { Adquisicion } from '../../models/Adquisicion.model' // For checking trade-in dependencies

export class ClienteService {
  public async create (data: CreateClienteDto): Promise<Cliente> {
    const contacto = await Contacto.findByPk(data.contacto_id)
    if (!contacto) {
      throw new Error(`El Contacto con ID ${data.contacto_id} no existe.`)
    }
    if (!contacto.activo) {
      throw new Error(`El Contacto con ID ${data.contacto_id} no está activo.`)
    }

    const existingClienteByContacto = await Cliente.findOne({
      where: { contacto_id: data.contacto_id }
    })
    if (existingClienteByContacto) {
      throw new Error(
        `El Contacto con ID ${data.contacto_id} ya está asignado a otro cliente (ID: ${existingClienteByContacto.id}).`
      )
    }

    try {
      const cliente = await Cliente.create(data as any)
      return cliente
    } catch (error: any) {
      console.error('Error al crear cliente:', error)
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new Error(
          'Error de clave foránea: Asegúrese de que el contacto_id es válido.'
        )
      }
      throw new Error('Error interno al crear el cliente.')
    }
  }

  public async getAll (
    page: number = 1,
    limit: number = 10,
    searchTerm?: string,
    activo?: string
  ): Promise<{ rows: Cliente[]; count: number }> {
    const offset = (page - 1) * limit
    const whereClause: any = {}

    if (activo !== undefined) {
      whereClause.activo = activo === 'true'
    }

    const includeClause = [
      {
        model: Contacto,
        as: 'contacto',
        attributes: ['nombre_completo', 'nombre_empresa', 'email', 'dni_ruc']
      }
    ]

    if (searchTerm) {
      whereClause[Op.or] = [
        { notas_cliente: { [Op.iLike]: `%${searchTerm}%` } },
        { '$contacto.nombre_completo$': { [Op.iLike]: `%${searchTerm}%` } },
        { '$contacto.nombre_empresa$': { [Op.iLike]: `%${searchTerm}%` } },
        { '$contacto.email$': { [Op.iLike]: `%${searchTerm}%` } },
        { '$contacto.dni_ruc$': { [Op.iLike]: `%${searchTerm}%` } }
      ]
    }

    return Cliente.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit,
      offset,
      order: [['id', 'ASC']]
    })
  }

  public async getById (id: number): Promise<Cliente | null> {
    const cliente = await Cliente.findByPk(id, {
      include: [{ model: Contacto, as: 'contacto' }]
    })
    if (!cliente) {
      throw new Error(`Cliente con ID ${id} no encontrado.`)
    }
    return cliente
  }

  public async update (id: number, data: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.getById(id)
    if (!cliente) {
      throw new Error(`Cliente con ID ${id} no encontrado para actualizar.`)
    }

    if (data.contacto_id && data.contacto_id !== cliente.contacto_id) {
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
      const existingClienteByContacto = await Cliente.findOne({
        where: { contacto_id: data.contacto_id, id: { [Op.ne]: id } }
      })
      if (existingClienteByContacto) {
        throw new Error(
          `El Contacto con ID ${data.contacto_id} ya está asignado a otro cliente.`
        )
      }
    }

    try {
      await cliente.update(data)
      return cliente.reload({ include: [{ model: Contacto, as: 'contacto' }] })
    } catch (error: any) {
      console.error(`Error al actualizar cliente con ID ${id}:`, error)
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new Error(
          'Error de clave foránea: Asegúrese de que el contacto_id es válido.'
        )
      }
      throw new Error('Error interno al actualizar el cliente.')
    }
  }

  public async delete (id: number): Promise<void> {
    const cliente = await this.getById(id)
    if (!cliente) {
      throw new Error(`Cliente con ID ${id} no encontrado para eliminar.`)
    }

    const comprasAsociadas = await Venta.count({ where: { cliente_id: id } }) // Assuming 'cliente_id' in Venta
    if (comprasAsociadas > 0) {
      throw new Error(
        `No se puede eliminar el cliente ID ${id}. Tiene ${comprasAsociadas} compra(s) asociada(s). Considere desactivarlo.`
      )
    }

    const tradeInsAsociados = await Adquisicion.count({
      where: { cliente_trade_in_id: id }
    })
    if (tradeInsAsociados > 0) {
      throw new Error(
        `No se puede eliminar el cliente ID ${id}. Tiene ${tradeInsAsociados} trade-in(s) asociado(s). Considere desactivarlo.`
      )
    }

    // Soft delete
    await cliente.update({ activo: false })
  }

  public async toggleActivo (id: number): Promise<Cliente> {
    const cliente = await this.getById(id)
    if (!cliente) {
      throw new Error(`Cliente con ID ${id} no encontrado.`)
    }

    if (cliente.activo === true) {
      // If attempting to deactivate
      // Add checks if deactivating a cliente with active associations is not allowed
      console.log('Cliente activo, no se puede desactivar por el momento.')
    } else {
      // If attempting to activate
      const contacto = await Contacto.findByPk(cliente.contacto_id)
      if (!contacto || !contacto.activo) {
        throw new Error(
          `No se puede activar el cliente. El contacto asociado (ID: ${cliente.contacto_id}) no existe o no está activo.`
        )
      }
    }

    cliente.activo = !cliente.activo
    await cliente.save()
    return cliente.reload({ include: [{ model: Contacto, as: 'contacto' }] })
  }
}
