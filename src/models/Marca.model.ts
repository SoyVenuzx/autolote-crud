import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript'
import { Modelo } from './Modelo.model'

@Table({
  tableName: 'marcas',
  timestamps: false
})
export class Marca extends Model {
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
  @HasMany(() => Modelo)
  modelos!: Modelo[]
}

export default Marca
