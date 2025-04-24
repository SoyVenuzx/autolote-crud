import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasOne
} from 'sequelize-typescript'
import { Vehiculo } from './Vehiculo.model'
import { Cliente } from './Cliente.model'
import { Empleado } from './Empleado.model'
import { Proveedor } from './Proveedor.model'
import { Factura } from './Factura.model'

type TipoPago = 'Contado' | 'Financiado' | 'Mixto' | 'Leasing' | 'Otro'
type EstadoVenta = 'Pendiente' | 'Completada' | 'Facturada' | 'Cancelada'

@Table({
  tableName: 'ventas',
  timestamps: false
})
export class Venta extends Model {
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

  @ForeignKey(() => Cliente)
  @Column({
    type: DataType.BIGINT,
    allowNull: false
  })
  cliente_id!: number

  @ForeignKey(() => Empleado)
  @Column({
    type: DataType.BIGINT,
    allowNull: false
  })
  vendedor_id!: number

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  fecha_venta!: Date

  @Column({
    type: DataType.DECIMAL(14, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  })
  precio_final_venta!: number

  @Column({
    type: DataType.DECIMAL(12, 2),
    validate: {
      min: 0
    }
  })
  impuestos_venta?: number

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  })
  descuento_aplicado!: number

  @Column({
    type: DataType.TEXT,
    validate: {
      isIn: [['Contado', 'Financiado', 'Mixto', 'Leasing', 'Otro']]
    }
  })
  tipo_pago?: TipoPago

  @Column({
    type: DataType.DECIMAL(14, 2),
    validate: {
      min: 0
    }
  })
  monto_inicial?: number

  @Column({
    type: DataType.INTEGER,
    validate: {
      min: 0
    }
  })
  numero_cuotas?: number

  @ForeignKey(() => Proveedor)
  @Column({
    type: DataType.BIGINT
  })
  entidad_financiera_id?: number

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    defaultValue: 'Pendiente',
    validate: {
      isIn: [['Pendiente', 'Completada', 'Facturada', 'Cancelada']]
    }
  })
  estado_venta!: EstadoVenta

  @Column({
    type: DataType.TEXT
  })
  notas_venta?: string

  // Relationships
  @BelongsTo(() => Vehiculo)
  vehiculo!: Vehiculo

  @BelongsTo(() => Cliente)
  cliente!: Cliente

  @BelongsTo(() => Empleado)
  vendedor!: Empleado

  @BelongsTo(() => Proveedor)
  entidad_financiera?: Proveedor

  @HasOne(() => Factura)
  factura!: Factura
}

export default Venta
