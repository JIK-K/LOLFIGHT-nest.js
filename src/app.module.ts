import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemberModule } from './modules/member/member.module';
import { GuildModule } from './modules/guild/guild.module';
import { MysqlModule } from './mysql/mysql.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MemberModule,
    GuildModule,
    MysqlModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
