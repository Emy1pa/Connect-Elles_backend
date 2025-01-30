import { Exclude, Transform } from 'class-transformer';
import { Category } from 'src/categories/category.entity';
import { Skill } from 'src/skills/skill.entity';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import { UserRole } from 'src/utils/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ObjectId,
  ObjectIdColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @ObjectIdColumn()
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: ObjectId;
  @Column({ type: 'varchar', length: '150', nullable: true })
  username: string;
  @Column({ type: 'varchar', length: '150' })
  fullName: string;
  @Column({ type: 'varchar', length: '250', unique: true })
  email: string;
  @Column()
  @Exclude()
  password: string;
  @Column({ type: 'enum', enum: UserRole, default: UserRole.NORMAL_USER })
  userRole: UserRole;
  @Column({ default: false })
  isAccountVerified: boolean;
  @Column({ default: false })
  isBanned: boolean;
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
  @Column({ nullable: true, default: null })
  profileImage: string;
  @OneToMany(() => Skill, (skill) => skill.user)
  skills?: Skill[];
  @OneToMany(() => Category, (category) => category.user)
  categories?: Category[];
}
