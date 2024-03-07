import { IsOptional } from 'class-validator';
import { BaseDTO } from 'src/base/base.dto';

export class MailDTO extends BaseDTO {
  @IsOptional()
  id: string;

  @IsOptional()
  mailAddr: string;

  @IsOptional()
  mailCode: string;

  @IsOptional()
  mailStatus: string;
}
