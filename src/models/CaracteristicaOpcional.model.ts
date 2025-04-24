import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany
} from 'sequelize-typescript'
import { Vehiculo } from './Vehiculo.model'
import { VehiculoCaracteristicaOpcional } from './VehiculoCaracteristicaOpcional.model'

@Table({
  tableName: 'caracteristicas_opcionales',
  timestamps: false
})
export class CaracteristicaOpcional extends Model {
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
  nombre_caracteristica!: string

  @Column({
    type: DataType.TEXT
  })
  descripcion?: string

  // Relationships
  @BelongsToMany(() => Vehiculo, () => VehiculoCaracteristicaOpcional)
  vehiculos!: Vehiculo[]
}

export default CaracteristicaOpcional
