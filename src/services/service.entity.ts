import { Transform } from 'class-transformer';
import { Category } from 'src/categories/category.entity';
import { User } from 'src/users/user.entity';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import { ServiceStatus } from 'src/utils/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'services' })
export class Service {
  @ObjectIdColumn()
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: ObjectId;
  @Column({ type: 'varchar', length: 100 })
  title: string;
  @Column({ type: 'text', nullable: false })
  description: string;
  @Column({
    type: 'enum',
    enum: ServiceStatus,
    default: ServiceStatus.AVAILABLE,
  })
  status: ServiceStatus;
  @Column({ nullable: true, default: null })
  serviceImage?: string;
  @Column({ type: 'int', nullable: false })
  duration: number;
  @Column({ type: 'double', precision: 10, scale: 2, nullable: false })
  price: number;
  @Column({ type: 'int', nullable: false })
  numberOfPlaces: number;
  @CreateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
  })
  createdAt: Date;
  @UpdateDateColumn({
    type: 'timestamp',
    onUpdate: CURRENT_TIMESTAMP,
    default: () => CURRENT_TIMESTAMP,
  })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.services)
  user: User;

  @ManyToOne(() => Category, (category) => category.services)
  category: Category;
}
