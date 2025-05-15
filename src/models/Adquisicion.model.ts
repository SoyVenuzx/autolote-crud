// models/Adquisicion.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript'
import { Vehiculo } from './Vehiculo.model'
import { Proveedor } from './Proveedor.model'
import { Cliente } from './Cliente.model'
import { Empleado } from './Empleado.model'

export type TipoAdquisicion =
  | 'Compra Directa'
  | 'Trade-In'
  | 'Consignacion'
  | 'Subasta'
  | 'Otro'

@Table({
  tableName: 'adquisiciones',
  timestamps: false
})
export class Adquisicion extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number

  @ForeignKey(() => Vehiculo)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    unique: true
  })
  vehiculo_id!: number

  @Column({
    type: DataType.DATEONLY,
    allowNull: false
  })
  fecha_adquisicion!: Date

  @Column({
    type: DataType.DECIMAL(14, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  })
  costo_adquisicion!: number

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      isIn: [['Compra Directa', 'Trade-In', 'Consignacion', 'Subasta', 'Otro']]
    }
  })
  tipo_adquisicion!: TipoAdquisicion

  @ForeignKey(() => Proveedor)
  @Column({
    type: DataType.BIGINT
  })
  proveedor_id?: number

  @ForeignKey(() => Cliente)
  @Column({
    type: DataType.BIGINT
  })
  cliente_trade_in_id?: number

  @ForeignKey(() => Empleado)
  @Column({
    type: DataType.BIGINT
  })
  empleado_registra_id?: number

  @Column({
    type: DataType.TEXT
  })
  notas_adquisicion?: string

  // Relationships
  @BelongsTo(() => Vehiculo)
  vehiculo!: Vehiculo

  @BelongsTo(() => Proveedor)
  proveedor?: Proveedor

  @BelongsTo(() => Cliente)
  cliente_trade_in?: Cliente

  @BelongsTo(() => Empleado)
  empleado_registra?: Empleado
}

export default Adquisicion
