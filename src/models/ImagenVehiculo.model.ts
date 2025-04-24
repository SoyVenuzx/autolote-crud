import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript'
import { Vehiculo } from './Vehiculo.model'

@Table({
  tableName: 'imagenes_vehiculo',
  timestamps: false
})
export class ImagenVehiculo extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number

  @ForeignKey(() => Vehiculo)
  @Column({
    type: DataType.BIGINT,
    allowNull: false
  })
  vehiculo_id!: number

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  url_imagen!: string

  @Column({
    type: DataType.TEXT
  })
  descripcion_imagen?: string

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  orden!: number

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  es_principal!: boolean

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  fecha_subida!: Date

  // Relationships
  @BelongsTo(() => Vehiculo)
  vehiculo!: Vehiculo
}

export default ImagenVehiculo
