import { Controller, Get, Query } from '@nestjs/common';
import SocketGateway from './socket.gateway';

@Controller('socket')
export class SocketController {
  constructor(private socketGateway: SocketGateway) {}
}
