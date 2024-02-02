import { BaseEntity } from 'src/base/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'member',
  orderBy: {
    createdAt: 'DESC',
  },
})
export class Member extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'member_id' })
  memberId: string;

  @Column({ name: 'member_pw' })
  memberPw: string;

  @Column({ name: 'member_name' })
  memberName: string;

  @Column({ name: 'member_phone', nullable: true })
  memberPhone: string;

  @Column({ name: 'member_guild', nullable: true })
  memberGuild: string;

  @Column()
  salt: string;
}
