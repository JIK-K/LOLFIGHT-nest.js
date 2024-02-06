import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mail } from './entites/mail.entity';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Builder } from 'builder-pattern';
import { MailDTO } from './DTOs/mail.dto';
import { MailMapper } from './mapper/mail.mapper';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommonUtil } from 'src/utils/common.util';
import { CODE_CONSTANT } from 'src/common/constants/common-code.constant';
import { Member } from '../member/entities/member.entity';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private mailMapper: MailMapper,
    @InjectRepository(Mail) private mailRepository: Repository<Mail>,
  ) {}

  /**
   * 3분인증 타임
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async updateMailStatus() {
    const mailsToUpdate = await this.mailRepository
      .createQueryBuilder('mail')
      .where('mail_status = :status', { status: 'N' })
      .andWhere('mail.createdAt <= :date', {
        date: new Date(Date.now() - 3 * 60 * 1000),
      })
      .getMany();

    for (const mail of mailsToUpdate) {
      mail.mailStatus = 'F';
    }

    await this.mailRepository.save(mailsToUpdate);
  }

  /**
   * 10분 지난 데이터 삭제
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async deleteRemainMail() {
    const mailsToUpdate = await this.mailRepository
      .createQueryBuilder('mail')
      .where('mail_status = :status', { status: 'F' })
      .getMany();

    for (const mail of mailsToUpdate) {
      await this.mailRepository.remove(mail);
    }
  }

  /**
   * mail send
   * @param mailDTO
   * @returns
   */
  async send(mailDTO: MailDTO): Promise<MailDTO> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const authLength = 6;
    let code = '';

    const existingMail = await this.mailRepository.findOne({
      where: { mailAddr: mailDTO.mailAddr },
    });

    if (existingMail) {
      // 이미 이메일이 존재하면 해당 행 삭제
      await this.mailRepository.remove(existingMail);
    }

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
      await this.mailRepository.save(mailAuthEntity),
    );
  }

  /**
   * mail auth
   * @param mailDTO
   * @returns
   */
  async auth(mailAddr: string, mailCode: string) {
    const mailAuthAccount = await this.mailRepository
      .createQueryBuilder('mail')
      .where('mail_addr = :addr', { addr: mailAddr })
      .getOne();

    if (!CommonUtil.isValid(mailAuthAccount)) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    if (mailAuthAccount.mailCode === mailCode) {
      mailAuthAccount.mailStatus = 'T';
      this.mailRepository.save(mailAuthAccount);
      return true;
    } else {
      return false;
    }
  }
}
