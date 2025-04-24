import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript'
import { Vehiculo } from './Vehiculo.model'

@Table({
  tableName: 'colores',
  timestamps: false
})
export class Color extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    unique: true
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
  @HasMany(() => Vehiculo)
  vehiculos!: Vehiculo[]
}

export default Color
