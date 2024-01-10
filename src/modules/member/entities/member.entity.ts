import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  memberId: string;

  @Column()
  memberPw: string;

  @Column()
  memberName: string;

  @Column()
  memberPhone: string;

  @Column()
  memberBirthDay: string;

  @Column()
  memberGuild: string;

  @Column()
  salt: string;

  @CreateDateColumn()
  createAt: Timestamp;

  @UpdateDateColumn()
  updateAt: Timestamp;
}
