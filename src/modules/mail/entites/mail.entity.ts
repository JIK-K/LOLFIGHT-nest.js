import { BaseEntity } from 'src/base/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'mail',
  orderBy: {
    createdAt: 'DESC',
  },
})
export class Mail extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'mail_addr' })
  mailAddr: string;

  @Column({ name: 'mail_code' })
  mailCode: string;

  @Column({ name: 'mail_status', default: 'N' })
  mailStatus: string;
}
