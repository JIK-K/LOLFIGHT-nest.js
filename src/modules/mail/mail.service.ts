import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mail } from './entites/mail.entity';
import { Repository } from 'typeorm';
import { Builder } from 'builder-pattern';
import { MailDTO } from './DTOs/mail.dto';
import { MailMapper } from './mapper/mail.mapper';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private mailMapper: MailMapper,
    @InjectRepository(Mail) private memberRepository: Repository<Mail>,
  ) {}

  /**
   * mail auth
   * @param mailDTO
   * @returns
   */
  async send(mailDTO: MailDTO): Promise<MailDTO> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const authLength = 6;
    let code = '';

    for (let i = 0; i < authLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }

    await this.mailerService.sendMail({
      // from: 보내는 사람의 이메일, 보내는 사람의 정보에 넣은 이메일과 동일한 이메일을 넣어주면 된다.
      // to: 받는 사람의 이메일
      // subject: 보내는 이메일의 제목
      // text: 이메일의 본문에 들어가는 내용
      // html: 이메일의 본문에 들어가는 html형태의 내용
      to: `${mailDTO.mailAddr}`,
      subject: 'LOL.FIGHT Register Mail Auth',
      text: `code : ${code}`,
      template: './register',
      context: {
        code: code,
      },
    });

    const mailAuthEntity: Mail = Builder<Mail>()
      .mailAddr(mailDTO.mailAddr)
      .mailCode(code)
      .build();

    return this.mailMapper.toDTO(
      await this.memberRepository.save(mailAuthEntity),
    );
  }
}
