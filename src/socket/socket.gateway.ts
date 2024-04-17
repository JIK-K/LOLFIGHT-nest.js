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
import { CommonUtil } from 'src/utils/common.util';

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
  fightRoom: string;
  team1: testRoom;
  team2: testRoom;
  readyCount: number;
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
  private testFightArray: Array<testFightRoom> = new Array();

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

  /**
   * 길드전 방 생성
   * @param client
   * @param data
   */
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

  /**
   * 길드전 방 참가
   * @param client
   * @param data
   */
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

  /**
   * 길드전 매칭
   * @param client
   * @param data
   */
  @SubscribeMessage('searchFight')
  handleSearchRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomName: string;
    },
  ) {
    let me: testRoom;
    for (const room of this.testWaitRoom) {
      if (room.name === data.roomName) {
        me = room;
        break;
      }
    }

    // 내가 속한 방을 찾는데 team1이랑 team2가 다 있다면 => 다시 돌린다.
    const existingRoomIndex = this.testFightArray.findIndex((fightRoom) => {
      return (
        (fightRoom.team1 === me || fightRoom.team2 === me) &&
        fightRoom.team1 &&
        fightRoom.team2
      );
    });

    if (existingRoomIndex !== -1) {
      //다시 돌리는 로직 => 나를 현재 방에서 제외한후 상대가 team2라면 team1으로 옮기고 나는 다시 team2가 비어있는 방을 찾는다.

      //내가 team1이라면
      if (this.testFightArray[existingRoomIndex].team1.name == me.name) {
        console.log('다시돌린다. 내가 team1일때');
        this.testFightArray[existingRoomIndex].team1 =
          this.testFightArray[existingRoomIndex].team2;
        this.testFightArray[existingRoomIndex].team2 = null;

        this.matchMaking(me);
      } else {
        console.log('다시돌린다. 내가 team2일때');
        this.testFightArray[existingRoomIndex].team2 = null;

        this.matchMaking(me);
      }
    } else {
      //만약 team2가 비어있는 방이있다? => 누군가 매칭을 돌리고 있다.
      this.matchMaking(me);
    }
  }

  /**
   * 매칭 취소 =? 방 폭파로 해야겠다
   * @param client
   * @param data
   */
  @SubscribeMessage('cancelSearch')
  handlecancelSearch(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomName: string;
    },
  ) {
    const index = this.testFightArray.findIndex(
      (testfight) => testfight.team1.name === data.roomName,
    );
    if (index !== -1) {
      this.testFightArray.splice(index, 1);
      console.log(data.roomName + ': 매칭취소');
      console.log(this.testFightArray);
    } else {
      console.log('이거 뜨면 사고라고 보면 됩니다.');
    }
  }

  @SubscribeMessage('readyFight')
  handleReadyFight(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      fightRoom: string;
    },
  ) {
    for (const fightRoom of this.testFightArray) {
      if (fightRoom.fightRoom === data.fightRoom) {
        fightRoom.readyCount++;
      }
    }
  }

  @SubscribeMessage('cancelReady')
  handleCancelReady(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      fightRoom: string;
    },
  ) {
    for (const fightRoom of this.testFightArray) {
      if (fightRoom.fightRoom === data.fightRoom) {
        fightRoom.readyCount--;
      }
    }
  }

  @SubscribeMessage('startFight')
  handleStartFight(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      fightRoom: string;
    },
  ) {
    for (const fightRoom of this.testFightArray) {
      if (fightRoom.fightRoom === data.fightRoom) {
        if (fightRoom.readyCount === 10) {
          console.log(
            '시작한다 : ' +
              fightRoom.fightRoom +
              '팀1 : ' +
              fightRoom.team1.name +
              '팀2 : ' +
              fightRoom.team2.name,
          );
        } else {
          console.log(
            '아직 10명다 준비안함 ReadyCount : ' + fightRoom.readyCount,
          );
        }
      }
    }
  }

  //========================================================================//
  //Function
  //========================================================================//
  matchMaking(me: testRoom) {
    const emptyIndexs: number[] = [];
    // team2가 비어있는 방의 인덱스를 찾아 emptyIndices 배열에 추가
    this.testFightArray.forEach((fightRoom, index) => {
      if (!fightRoom.team2) {
        emptyIndexs.push(index);
      }
    });
    const emptyIndex =
      emptyIndexs[Math.floor(Math.random() * emptyIndexs.length)];

    if (emptyIndexs.length > 0) {
      //내가 돌리고있는 길드의 team2로 들어간다.
      this.testFightArray[emptyIndex].team2 = me;
      console.log('매칭완료 \n', this.testFightArray);
    } else {
      //아무도 없으면 내가 방을 판다.
      const randomString = CommonUtil.uuidv4();
      const fightRoom: testFightRoom = {
        fightRoom: randomString,
        team1: me,
        team2: null,
        readyCount: 0,
      };
      this.testFightArray.push(fightRoom);
      console.log('빈 방 생성 \n', this.testFightArray);
    }
  }
}
