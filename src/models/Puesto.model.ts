import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript'
import { Empleado } from './Empleado.model'

@Table({
  tableName: 'puestos',
  timestamps: false
})
export class Puesto extends Model {
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
  nombre_puesto!: string

  @Column({
    type: DataType.TEXT
  })
  descripcion?: string

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
  @HasMany(() => Empleado)
  empleados!: Empleado[]
}

export default Puesto
