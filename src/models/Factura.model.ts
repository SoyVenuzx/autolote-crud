import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript'
import { Venta } from './Venta.model'

type EstadoFactura =
  | 'Pendiente'
  | 'Pagada Parcialmente'
  | 'Pagada Totalmente'
  | 'Vencida'
  | 'Anulada'

@Table({
  tableName: 'facturas',
  timestamps: false
})
export class Factura extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number

  @ForeignKey(() => Venta)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    unique: true
  })
  venta_id!: number

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    unique: true
  })
  numero_factura!: string

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  fecha_emision!: Date

  @Column({
    type: DataType.DATEONLY
  })
  fecha_vencimiento?: Date

  @Column({
    type: DataType.DECIMAL(14, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  })
  monto_subtotal!: number

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  })
  monto_impuestos!: number

  @Column({
    type: DataType.DECIMAL(14, 2)
  })
  monto_total!: number

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    defaultValue: 'Pendiente',
    validate: {
      isIn: [
        [
          'Pendiente',
          'Pagada Parcialmente',
          'Pagada Totalmente',
          'Vencida',
          'Anulada'
        ]
      ]
    }
  })
  estado_factura!: EstadoFactura

  @Column({
    type: DataType.TEXT
  })
  metodo_pago_confirmado?: string

  @Column({
    type: DataType.TEXT
  })
  referencia_pago?: string

  @Column({
    type: DataType.TEXT
  })
  notas_factura?: string

  // Relationships
  @BelongsTo(() => Venta)
  venta!: Venta
}

export default Factura
