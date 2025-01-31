import { Transform } from 'class-transformer';
import { Category } from 'src/categories/category.entity';
import { User } from 'src/users/user.entity';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import { BlogStatus } from 'src/utils/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'blogs' })
export class Blog {
  @ObjectIdColumn()
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: ObjectId;
  @Column({ type: 'varchar', length: 100 })
  title: string;
  @Column({ type: 'text' })
  content: string;
  @Column({ type: 'enum', enum: BlogStatus, default: BlogStatus.DRAFT })
  status: BlogStatus;
  @Column({ nullable: true, default: null })
  blogImage?: string;
  @Column({ type: 'varchar', length: '250' })
  summary: string;
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

  @ManyToOne(() => User, (user) => user.blogs)
  user: User;

  @ManyToOne(() => Category, (category) => category.blogs)
  category: Category;
}
