import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'kdkd4813',
      database: 'lolfight',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true, // 개발 환경에서만 사용 (프로덕션 환경에서는 비활성화)
    }),
  ],
})
export class MysqlModule {}
