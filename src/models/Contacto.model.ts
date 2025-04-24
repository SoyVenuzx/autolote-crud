import { Table, Column, Model, DataType, HasOne } from 'sequelize-typescript'
import { Cliente } from './Cliente.model'
import { Empleado } from './Empleado.model'
import { Proveedor } from './Proveedor.model'

type TipoDocumento = 'DNI' | 'RUC' | 'Pasaporte' | 'Cedula' | 'Otro'

@Table({
  tableName: 'contactos',
  timestamps: false
})
export class Contacto extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  nombre_completo!: string

  @Column({
    type: DataType.TEXT
  })
  nombre_empresa?: string

  @Column({
    type: DataType.TEXT,
    unique: true,
    validate: {
      isEmail: true
    }
  })
  email?: string

  @Column({
    type: DataType.TEXT,
    validate: {
      is: /^[0-9+() -]+$/,
      len: [7, 20]
    }
  })
  telefono_principal?: string

  @Column({
    type: DataType.TEXT,
    validate: {
      is: /^[0-9+() -]+$/,
      len: [7, 20]
    }
  })
  telefono_secundario?: string

  @Column({
    type: DataType.TEXT
  })
  direccion_completa?: string

  @Column({
    type: DataType.TEXT
  })
  ciudad?: string

  @Column({
    type: DataType.TEXT
  })
  pais?: string

  @Column({
    type: DataType.TEXT,
    validate: {
      isIn: [['DNI', 'RUC', 'Pasaporte', 'Cedula', 'Otro']]
    }
  })
  tipo_documento?: TipoDocumento

  @Column({
    type: DataType.TEXT
  })
  dni_ruc?: string

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  fecha_registro!: Date

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  activo!: boolean

  // Relationships
  @HasOne(() => Cliente)
  cliente!: Cliente

  @HasOne(() => Empleado)
  empleado!: Empleado

  @HasOne(() => Proveedor)
  proveedor!: Proveedor
}

export default Contacto
