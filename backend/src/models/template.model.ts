import { Table, Column, Model, DataType, PrimaryKey, Default, AllowNull, HasMany } from 'sequelize-typescript';
import { Cv } from './cv.model';

@Table({
  tableName: 'templates',
  timestamps: false, // As per spec, no created_at/updated_at for templates
})
export class Template extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_premium!: boolean;

  @Column(DataType.STRING)
  thumbnail_url?: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  html_structure_path!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  css_structure_path!: string;

  @Column(DataType.JSONB)
  customizable_fields?: any;

  @HasMany(() => Cv)
  cvs!: Cv[];
}
