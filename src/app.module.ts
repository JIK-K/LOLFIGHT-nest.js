import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemberModule } from './modules/member/member.module';
import { GuildModule } from './modules/guild/guild.module';
import { MysqlModule } from './mysql/mysql.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './modules/mail/mail.module';
import { BoardModule } from './modules/board/board.module';
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/comment/comment.module';
import { SocketModule } from './socket/socket.module';
import { FileController } from './file/file.controller';
import { BattleModule } from './modules/battle/battle.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'public'),
    // }),
    ConfigModule.forRoot(),
    MemberModule,
    GuildModule,
    MysqlModule,
    MailModule,
    BoardModule,
    PostModule,
    CommentModule,
    SocketModule,
    BattleModule,
    AuthModule,
  ],
  controllers: [AppController, FileController],
  providers: [AppService],
})
export class AppModule {}
