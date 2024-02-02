import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { MailService } from './mail.service';
import { ResponseDTO } from 'src/common/DTOs/response.dto';
import { ResponseUtil } from 'src/utils/response.util';
import { MailDTO } from './DTOs/mail.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}
  private logger: Logger = new Logger();

  /**
   * Mail Register Auth Code send
   * @param mailDTO
   * @returns
   */
  @Post()
  async sendAuthCode(@Body() mailDTO: MailDTO): Promise<ResponseDTO<MailDTO>> {
    this.logger.log(`${mailDTO.mailAddr} : Auth Mail Send`);
    return ResponseUtil.makeSuccessResponse(
      await this.mailService.send(mailDTO),
    );
  }

  @Get('/auth')
  async authMemberMail(
    @Body() mailDTO: MailDTO,
  ): Promise<ResponseDTO<boolean>> {
    this.logger.log(`${mailDTO.mailAddr} : Mail, ${mailDTO.mailCode} : Code`);
    return ResponseUtil.makeSuccessResponse(
      await this.mailService.auth(mailDTO),
    );
  }
}
