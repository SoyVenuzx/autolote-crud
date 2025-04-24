import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript'
import { Vehiculo } from './Vehiculo.model'
import { CaracteristicaOpcional } from './CaracteristicaOpcional.model'

@Table({
  tableName: 'vehiculo_caracteristicas_opcionales',
  timestamps: false
})
export class VehiculoCaracteristicaOpcional extends Model {
  @ForeignKey(() => Vehiculo)
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    allowNull: false
  })
  vehiculo_id!: number

  @ForeignKey(() => CaracteristicaOpcional)
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    allowNull: false
  })
  caracteristica_id!: number

  @Column({
    type: DataType.TEXT
  })
  valor_caracteristica?: string

  // Relationships
  @BelongsTo(() => Vehiculo)
  vehiculo!: Vehiculo

  @BelongsTo(() => CaracteristicaOpcional)
  caracteristica!: CaracteristicaOpcional
}

export default VehiculoCaracteristicaOpcional
