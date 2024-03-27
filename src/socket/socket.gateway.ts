import { Injectable, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3001, {
  cors: { origin: '*' },
})
@Injectable()
export default class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor() {}
  @WebSocketServer() server: Server;
  private namespaces: Map<string, Socket[]> = new Map();
  private logger: Logger = new Logger('FileEventsGateway');

  afterInit(server: any) {
    this.logger.log('Socket DownloadFile server init ✅');
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client Disconnected : ${client.id}`);
  }

  handleConnection(client: any, ...args: any[]) {
    const memberName = client.handshake.query.memberName;
    const namespace = `member-${memberName}`;
    console.log(namespace);
    if (!this.namespaces.has(namespace)) {
      this.namespaces.set(namespace, []);
    }
    this.namespaces.get(namespace).push(client);

    this.logger.log(
      `Client Connected : ${client.id} ${client.request.connection.remoteAddress}`,
    );
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
