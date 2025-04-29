import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany
} from 'sequelize-typescript'
import User from './User.model'
import UserRole from './UserRole.model'

@Table({
  tableName: 'roles',
  timestamps: true
})
export default class Role extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  name!: string

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  description!: string

  // Relación con Usuarios (muchos a muchos)
  @BelongsToMany(() => User, {
    through: () => UserRole,
    foreignKey: 'roleId',
    otherKey: 'userId'
  })
  users!: User[]
}
