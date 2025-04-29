import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BelongsToMany
} from 'sequelize-typescript'
import bcrypt from 'bcryptjs'
import Role from './Role.model'
import UserRole from './UserRole.model'

@Table({
  tableName: 'users',
  timestamps: true
})
export default class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  })
  email!: string

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  username!: string

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  password!: string

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  isActive!: boolean

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  lastLogin!: Date

  // Relación con Roles (muchos a muchos)
  @BelongsToMany(() => Role, {
    through: () => UserRole,
    foreignKey: 'userId',
    otherKey: 'roleId'
  })
  roles!: Role[]

  // Método para verificar la contraseña
  async validatePassword (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
  }

  // Hook para hashear la contraseña antes de crear el usuario
  @BeforeCreate
  static async hashPassword (instance: User) {
    const salt = await bcrypt.genSalt(10)
    instance.password = await bcrypt.hash(instance.password, salt)
  }

  // Método para devolver el usuario sin la contraseña
  toJSON () {
    const values = { ...this.get() }
    delete values.password
    return values
  }
}
