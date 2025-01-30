import { Transform } from 'class-transformer';
import { User } from 'src/users/user.entity';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'categories' })
export class Category {
  @ObjectIdColumn()
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: ObjectId;
  @Column({ type: 'varchar', length: '100' })
  title: string;

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
  @ManyToOne(() => User, (user) => user.categories)
  user: User;
}
