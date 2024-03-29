import { Injectable, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
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
    this.logger.log('Socket server init ✅');
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client Disconnected : ${client.id}`);
  }

  handleConnection(client: any, ...args: any[]) {
    const memberName = client.handshake.query.memberName;
    const guildName = client.handshake.query.guildName;
    const namespace = `${guildName}-${memberName}`;

    if (!this.namespaces.has(namespace)) {
      this.namespaces.set(namespace, []);
    }
    this.namespaces.get(namespace).push(client);

    this.logger.log(
      `Client Connected : ${client.id} ${client.request.connection.remoteAddress}`,
    );
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    messageData: { memberName: string; guildName: string; message: string },
  ) {
    const guildName = messageData.guildName;
    const message = `[${messageData.memberName}]-${messageData.message}`;

    this.namespaces.forEach((socketsInNamespace, namespace) => {
      if (namespace.includes(guildName)) {
        socketsInNamespace.forEach((socket) => {
          socket.emit('message', message);
        });
      }
    });
  }
}
