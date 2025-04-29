import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript'
import User from './User.model'
import Role from './Role.model'

@Table({
  tableName: 'user_roles',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'roleId']
    }
  ]
})
export default class UserRole extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  userId!: string

  @ForeignKey(() => Role)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  roleId!: string

  @BelongsTo(() => User)
  user!: User

  @BelongsTo(() => Role)
  role!: Role
}
