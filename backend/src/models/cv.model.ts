import { Table, Column, Model, DataType, PrimaryKey, Default, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';
import { Template } from './template.model';

@Table({
  tableName: 'cvs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Cv extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  user_id!: string;

  @BelongsTo(() => User)
  user!: User;

  @Default('My CV')
  @Column(DataType.STRING)
  title!: string;

  @AllowNull(false)
  @Column(DataType.JSONB)
  cv_data!: any; 

  @ForeignKey(() => Template)
  @Column(DataType.UUID)
  template_id?: string;

  @BelongsTo(() => Template)
  template?: Template;

  @Column(DataType.JSONB)
  template_customization?: any;

  // created_at and updated_at are handled by Sequelize due to timestamps:true and mapping

  @Default(DataType.NOW) 
  @Column(DataType.DATE)
  last_accessed_at!: Date;
}
