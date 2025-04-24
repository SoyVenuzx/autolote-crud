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
import { Puesto } from './Puesto.model'
import { Venta } from './Venta.model'
import { Adquisicion } from './Adquisicion.model'

@Table({
  tableName: 'empleados',
  timestamps: false
})
export class Empleado extends Model {
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

  @ForeignKey(() => Puesto)
  @Column({
    type: DataType.BIGINT,
    allowNull: false
  })
  puesto_id!: number

  @Column({
    type: DataType.DATEONLY
  })
  fecha_contratacion?: Date

  @Column({
    type: DataType.DATEONLY
  })
  fecha_desvinculacion?: Date

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  activo!: boolean

  // Relationships
  @BelongsTo(() => Contacto)
  contacto!: Contacto

  @BelongsTo(() => Puesto)
  puesto!: Puesto

  @HasMany(() => Venta, 'vendedor_id')
  ventas!: Venta[]

  @HasMany(() => Adquisicion, 'empleado_registra_id')
  adquisiciones!: Adquisicion[]
}

export default Empleado
