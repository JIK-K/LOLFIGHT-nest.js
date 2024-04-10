import { Controller, Get, Logger, Query } from '@nestjs/common';
import SocketGateway from './socket.gateway';
import { ResponseDTO } from 'src/common/DTOs/response.dto';

@Controller('socket')
export class SocketController {
  constructor(private socketGateway: SocketGateway) {}
  private logger: Logger = new Logger();
}
