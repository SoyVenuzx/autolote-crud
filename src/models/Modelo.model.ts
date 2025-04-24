import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany
} from 'sequelize-typescript'
import { Marca } from './Marca.model'
import { Vehiculo } from './Vehiculo.model'

@Table({
  tableName: 'modelos',
  timestamps: false
})
export class Modelo extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number

  @ForeignKey(() => Marca)
  @Column({
    type: DataType.BIGINT,
    allowNull: false
  })
  marca_id!: number

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  nombre!: string

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  fecha_creacion!: Date

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  activo!: boolean

  // Relationships
  @BelongsTo(() => Marca)
  marca!: Marca

  @HasMany(() => Vehiculo)
  vehiculos!: Vehiculo[]
}

export default Modelo
