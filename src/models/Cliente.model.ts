import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany
} from 'sequelize-typescript'
import { Contacto } from './Contacto.model'
import { Venta } from './Venta.model'
import { Adquisicion } from './Adquisicion.model'

@Table({
  tableName: 'clientes',
  timestamps: false
})
export class Cliente extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number

  @ForeignKey(() => Contacto)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    unique: true
  })
  contacto_id!: number

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  fecha_registro_cliente!: Date

  @Column({
    type: DataType.TEXT
  })
  notas_cliente?: string

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  activo!: boolean

  // Relationships
  @BelongsTo(() => Contacto)
  contacto!: Contacto

  @HasMany(() => Venta)
  compras!: Venta[]

  @HasMany(() => Adquisicion, 'cliente_trade_in_id')
  trade_ins!: Adquisicion[]
}

export default Cliente
