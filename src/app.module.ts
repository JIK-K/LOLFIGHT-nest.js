import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemberModule } from './modules/member/member.module';
import { GuildModule } from './modules/guild/guild.module';
import { MysqlModule } from './mysql/mysql.module';

@Module({
  imports: [MemberModule, GuildModule, MysqlModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
