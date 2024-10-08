import { IsOptional } from 'class-validator';
import { BaseDTO } from 'src/base/base.dto';

export class JudgmentDTO extends BaseDTO {
  @IsOptional()
  id: string;

  @IsOptional()
  judgmentWriter: string;

  @IsOptional()
  judgmentTitle: string;

  @IsOptional()
  judgmentDesc: string;

  @IsOptional()
  judgmentView: number;

  @IsOptional()
  judgmentLike: number;

  @IsOptional()
  judgmentLeftChampion: string;
  @IsOptional()
  judgmentLeftName: string;
  @IsOptional()
  judgmentLeftTier: string;
  @IsOptional()
  judgmentLeftLine: string;
  @IsOptional()
  judgmentLeftLike: number;

  @IsOptional()
  judgmentRightChampion: string;
  @IsOptional()
  judgmentRightName: string;
  @IsOptional()
  judgmentRightTier: string;
  @IsOptional()
  judgmentRightLine: string;
  @IsOptional()
  judgmentRightLike: number;

  @IsOptional()
  judgmentVideo: string;
}
