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
import { Adquisicion } from './Adquisicion.model'
import { Venta } from './Venta.model'

@Table({
  tableName: 'proveedores',
  timestamps: false
})
export class Proveedor extends Model {
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
    type: DataType.TEXT
  })
  tipo_proveedor?: string

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  fecha_registro_proveedor!: Date

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  activo!: boolean

  // Relationships
  @BelongsTo(() => Contacto)
  contacto!: Contacto

  @HasMany(() => Adquisicion)
  adquisiciones!: Adquisicion[]

  @HasMany(() => Venta, 'entidad_financiera_id')
  financiamientos!: Venta[]
}

export default Proveedor
