import { Table, Column, Model, DataType, PrimaryKey, Default, Unique, AllowNull, HasMany } from 'sequelize-typescript';
import { Cv } from './cv.model'; 

@Table({
  tableName: 'users',
  timestamps: true, 
  createdAt: 'created_at', 
  updatedAt: 'updated_at', 
})
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  email!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  password_hash!: string;

  // created_at and updated_at are handled by Sequelize due to timestamps:true and mapping

  @Unique
  @Column(DataType.STRING)
  stripe_customer_id?: string;

  @Unique
  @Column(DataType.STRING)
  subscription_id?: string;

  @Column(DataType.STRING)
  subscription_status?: string;

  @Default('free')
  @Column(DataType.STRING)
  plan_type!: string;

  @Column(DataType.DATE)
  current_period_end?: Date;

  @HasMany(() => Cv)
  cvs!: Cv[];
}
