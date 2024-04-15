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

interface testRoom {
  name: string;
  person: string[];
}
interface testFightRoom {
  team1: testRoom;
  team2: testRoom;
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

  private testWaitRoom: Set<testRoom> = new Set();
  private testFightArray: Array<testFightRoom[]> = new Array();

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
    data: {
      name: string;
      person: string;
    },
    // roomData: {
    //   member: MemberDTO;
    //   roomName: string;
    //   memberCount: number;
    //   status: string;
    // },
  ) {
    // const newRoom: WaitingRoom = {
    //   members: [roomData.member],
    //   roomName: roomData.member.memberGuild.guildName + '-' + roomData.roomName,
    //   memberCount: roomData.memberCount,
    //   status: roomData.status,
    // };

    let isDuplicate = false;

    const testroom: testRoom = {
      name: data.name,
      person: [data.person],
    };
    if (testroom.name != undefined && testroom.person != undefined) {
      const exist = this.testWaitRoom.forEach((room) => {
        if (room.name == data.name) {
          isDuplicate = true;
        }
      });
      if (!isDuplicate) {
        this.testWaitRoom.add(testroom);
        console.log(this.testWaitRoom);
      }
    }

    // this.guildWaitingRoom.add(newRoom);
    // console.log(newRoom);
    // client.emit('createRoom', newRoom);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomName: string;
      person: string;
    },
  ) {
    this.testWaitRoom.forEach((room) => {
      if (room.name == data.roomName) {
        room.person.push(data.person);
      }
    });
    const yaya: testRoom[] = Array.from(this.testWaitRoom);
    console.log('joinRoom', yaya);
  }

  @SubscribeMessage('searchFight')
  handleSearchRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomName: string;
    },
  ) {
    let team1: testRoom;
    for (const room of this.testWaitRoom) {
      if (room.name === data.roomName) {
        team1 = room;
        break;
      }
    }

    // 비어있는 team2를 찾습니다.
    const emptyIndex = this.testFightArray.findIndex(
      (fightRoom) => !fightRoom[0]?.team2,
    );
    if (emptyIndex !== -1) {
      // 비어있는 team2에 정보를 추가합니다.
      this.testFightArray[emptyIndex][0].team2 = team1;
      console.log('매칭완료 \n', this.testFightArray);
    } else {
      // 비어있는 team2가 없는 경우 새로운 배열에 추가합니다.
      const fightRoom: testFightRoom = {
        team1: team1,
        team2: null,
      };
      this.testFightArray.push([fightRoom]);
      console.log('아무도없을떄 \n', this.testFightArray);
    }
  }

  @SubscribeMessage('cancelSearch')
  handlecancelSearch(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomName: string;
    },
  ) {
    const index = this.testFightArray.findIndex(
      (testfight) => testfight[0]?.team1.name == data.roomName,
    );
    if (index !== -1) {
      this.testFightArray.splice(index, 1);
      console.log(data.roomName + ': 매칭취소');
      console.log(this.testFightArray);
    } else {
      console.log('이거뜨면 사고라고 보면된다.');
    }
  }
}
