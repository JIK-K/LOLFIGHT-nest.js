import { BaseEntity } from 'src/base/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'judgment',
  orderBy: {
    createdAt: 'DESC',
  },
})
export class Judgment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'judgment_writer' })
  judgmentWriter: string;

  @Column({ name: `judgment_title` })
  judgmentTitle: string;

  @Column({ name: `judgment_desc`, type: 'text' })
  judgmentDesc: string;

  @Column({ name: `judgment_view`, default: 0 })
  judgmentView: number;

  @Column({ name: `judgment_left_champion` })
  judgmentLeftChampion: string;

  @Column({ name: `judgment_left_name` })
  judgmentLeftName: string;

  @Column({ name: `judgment_left_tier` })
  judgmentLeftTier: string;

  @Column({ name: `judgment_left_line` })
  judgmentLeftLine: string;

  @Column({ name: `judgment_left_like`, default: 0 })
  judgmentLeftLike: number;

  @Column({ name: `judgment_right_champion` })
  judgmentRightChampion: string;

  @Column({ name: `judgment_right_name` })
  judgmentRightName: string;

  @Column({ name: `judgment_right_tier` })
  judgmentRightTier: string;

  @Column({ name: `judgment_right_line` })
  judgmentRightLine: string;

  @Column({ name: `judgment_right_like`, default: 0 })
  judgmentRightLike: number;

  @Column({ name: `judgment_video` })
  judgmentVideo: string;
}
