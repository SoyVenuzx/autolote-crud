// models/Vehiculo.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  HasOne,
  BelongsToMany
} from 'sequelize-typescript'
import { Modelo } from './Modelo.model'
import { Color } from './Color.model'
import { TipoTransmision } from './TipoTransmision.model'
import { TipoCombustible } from './TipoCombustible.model'
import { ImagenVehiculo } from './ImagenVehiculo.model'
import { Adquisicion } from './Adquisicion.model'
import { Venta } from './Venta.model'
import { CaracteristicaOpcional } from './CaracteristicaOpcional.model'
import { VehiculoCaracteristicaOpcional } from './VehiculoCaracteristicaOpcional.model'

type EstadoInventario =
  | 'Disponible'
  | 'Reservado'
  | 'Vendido'
  | 'En Preparacion'
  | 'Consignacion'
  | 'No Disponible'

@Table({
  tableName: 'vehiculos',
  timestamps: false
})
export class Vehiculo extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number

  @ForeignKey(() => Modelo)
  @Column({
    type: DataType.BIGINT,
    allowNull: false
  })
  modelo_id!: number

  @ForeignKey(() => Color)
  @Column({
    type: DataType.BIGINT,
    allowNull: false
  })
  color_id!: number

  @ForeignKey(() => TipoTransmision)
  @Column({
    type: DataType.BIGINT,
    allowNull: false
  })
  tipo_transmision_id!: number

  @ForeignKey(() => TipoCombustible)
  @Column({
    type: DataType.BIGINT,
    allowNull: false
  })
  tipo_combustible_id!: number

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1900,
      max: new Date().getFullYear() + 2
    }
  })
  anio!: number

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    unique: true
  })
  vin!: string

  @Column({
    type: DataType.TEXT,
    unique: true
  })
  numero_motor?: string

  @Column({
    type: DataType.TEXT,
    unique: true
  })
  numero_chasis?: string

  @Column({
    type: DataType.INTEGER,
    validate: {
      min: 0
    }
  })
  kilometraje?: number

  @Column({
    type: DataType.INTEGER,
    validate: {
      min: 1,
      max: 9
    }
  })
  numero_puertas?: number

  @Column({
    type: DataType.INTEGER,
    validate: {
      min: 1
    }
  })
  capacidad_pasajeros?: number

  @Column({
    type: DataType.DECIMAL(14, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  })
  precio_base!: number

  @Column({
    type: DataType.DECIMAL(14, 2),
    validate: {
      min: 0
    }
  })
  precio_venta_sugerido?: number

  @Column({
    type: DataType.TEXT
  })
  descripcion_adicional?: string

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    defaultValue: 'En Preparacion',
    validate: {
      isIn: [
        [
          'Disponible',
          'Reservado',
          'Vendido',
          'En Preparacion',
          'Consignacion',
          'No Disponible'
        ]
      ]
    }
  })
  estado_inventario!: EstadoInventario

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  fecha_ingreso_sistema!: Date

  @Column({
    type: DataType.TEXT
  })
  ubicacion_fisica?: string

  // Relationships
  @BelongsTo(() => Modelo)
  modelo!: Modelo

  @BelongsTo(() => Color)
  color!: Color

  @BelongsTo(() => TipoTransmision)
  tipo_transmision!: TipoTransmision

  @BelongsTo(() => TipoCombustible)
  tipo_combustible!: TipoCombustible

  @HasMany(() => ImagenVehiculo)
  imagenes!: ImagenVehiculo[]

  @HasOne(() => Adquisicion)
  adquisicion!: Adquisicion

  @HasOne(() => Venta)
  venta!: Venta

  @BelongsToMany(
    () => CaracteristicaOpcional,
    () => VehiculoCaracteristicaOpcional
  )
  caracteristicas!: CaracteristicaOpcional[]
}

export default Vehiculo
