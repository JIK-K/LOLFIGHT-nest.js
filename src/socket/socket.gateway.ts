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
import { MemberDTO } from 'src/modules/member/DTOs/member.dto';

interface FightingRoom {
  Room: MemberDTO[];
}
interface WaitingRoom {
  members: MemberDTO[];
  roomName: string; //guildName-roomMaster의 방
  memberCount: number;
  status: string; //대기중 : "waiting", 진행중: "Fighting"
}

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
  private onlineMembers: Set<string> = new Set();

  private guildWaitingRoom: Set<WaitingRoom> = new Set();
  private fightGuilds: Array<FightingRoom[]> = new Array();

  private logger: Logger = new Logger('FileEventsGateway');

  afterInit(server: any) {
    this.logger.log('Socket server init ✅');
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client Disconnected : ${client.id}`);

    const namespaceToRemove: string | undefined = Array.from(
      this.namespaces.keys(),
    ).find((namespace) => {
      return namespace;
    });

    if (namespaceToRemove) {
      this.onlineMembers.delete(namespaceToRemove.split('-')[1]);
    }
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
    console.log(this.onlineMembers);
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

  @SubscribeMessage('online')
  handleOnlineMember(
    @ConnectedSocket() clinet: Socket,
    @MessageBody() data: { guildName: string },
  ) {
    this.namespaces.forEach((socketInNamespace, namespace) => {
      if (namespace.includes(data.guildName)) {
        this.onlineMembers.add(namespace.substring(data.guildName.length + 1));
        console.log(this.onlineMembers);
        const onlineMembersArray: string[] = Array.from(this.onlineMembers);
        clinet.emit('online', onlineMembersArray);
      }
    });
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    roomData: {
      member: MemberDTO;
      roomName: string;
      memberCount: number;
      status: string;
    },
  ) {
    const newRoom: WaitingRoom = {
      members: [roomData.member],
      roomName: roomData.member.memberGuild.guildName + '-' + roomData.roomName,
      memberCount: roomData.memberCount,
      status: roomData.status,
    };

    this.guildWaitingRoom.add(newRoom);
    console.log(newRoom);
    client.emit('createRoom', newRoom);
  }
}
