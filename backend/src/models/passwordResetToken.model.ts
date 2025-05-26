import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Default } from 'sequelize-typescript';
import { User } from './user.model';
import { v4 as uuidv4 } from 'uuid';

@Table({
  tableName: 'password_reset_tokens',
  timestamps: true, // Adds createdAt and updatedAt
})
export class PasswordResetToken extends Model<PasswordResetToken> {
  @Default(uuidv4)
  @Column({
    type: DataType.UUID,
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true, // Hashed token, uniqueness is good
  })
  token!: string; // This will store the HASHED token

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'expires_at',
  })
  expiresAt!: Date;
}
