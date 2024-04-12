import { Module } from '@nestjs/common';
import { SocketController } from './socket.controller';
import SocketGateway from './socket.gateway';

@Module({
  providers: [SocketGateway],
  controllers: [SocketController],
})
export class SocketModule {}
