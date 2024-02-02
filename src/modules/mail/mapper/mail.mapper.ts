import { Injectable } from '@nestjs/common';
import { Builder } from 'builder-pattern';
import { Mail } from '../entites/mail.entity';
import { MailDTO } from '../DTOs/mail.dto';

@Injectable()
export class MailMapper {
  constructor() {}

  toDTO(mailEntity: Mail): MailDTO {
    const { id, mailAddr, mailCode, mailStatus } = mailEntity;

    return Builder<MailDTO>()
      .id(id)
      .mailAddr(mailAddr)
      .mailCode(mailCode)
      .mailStatus(mailStatus)
      .build();
  }
}
