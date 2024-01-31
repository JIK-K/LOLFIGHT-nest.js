import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mail } from './entites/mail.entity';
import { MailMapper } from './mapper/mail.mapper';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD,
          },
        },
        defaults: {
          from: `"LOL.FIGHT" <${process.env.EMAIL_ADDRESS}>`,
        },
        template: {
          dir: path.join(__dirname, './templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    TypeOrmModule.forFeature([Mail]),
  ],
  controllers: [MailController],
  providers: [MailService, MailMapper],
  exports: [MailService, MailMapper],
})
export class MailModule {}
