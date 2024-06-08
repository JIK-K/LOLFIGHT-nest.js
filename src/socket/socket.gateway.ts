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
  fightRoomName: string;
  team_A: WaitingRoom;
  team_B: WaitingRoom;
  readyCount: number;
  status: string;
}
interface WaitingRoom {
  members: MatchMembers[];
  roomName: string; //guildName-roomMaster의 방
  memberCount: number; //5명
  status: string; //대기중 : "waiting", 진행중: "Fighting"
}
interface MatchMembers {
  member: MemberDTO;
  isReady: boolean;
  isLeader: boolean;
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

  private guildWaitingRoom: Array<WaitingRoom> = new Array();
  private guildFightingRoom: Array<FightingRoom> = new Array();

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
      console.log('수정전', this.guildWaitingRoom);

      const roomIndex = this.guildWaitingRoom.findIndex((room) =>
        room.roomName.includes(namespaceToRemove.split('-')[1]),
      );
      this.guildWaitingRoom.splice(roomIndex, 1);
      client.to(namespaceToRemove).emit('leaveRoom', null);
      client.leave(namespaceToRemove);

      console.log('수정후', this.guildWaitingRoom);
      this.onlineMembers.delete(namespaceToRemove.split('-')[1]);
    }
  }

  handleConnection(client: any, ...args: any[]) {
    const memberName = client.handshake.query.memberName;
    const guildName = client.handshake.query.guildName;
    const namespace = `${guildName}-${memberName}`;
    console.log(namespace);

    if (!this.namespaces.has(namespace)) {
      this.namespaces.set(namespace, []);
    }
    this.namespaces.get(namespace).push(client);

    this.logger.log(
      `Client Connected : ${client.id} ${client.request.connection.remoteAddress}`,
    );
    console.log(this.onlineMembers);
  }

  /**
   * Message
   * @param client
   * @param messageData
   */
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

  /**
   * 내전방 Message
   * @param client
   * @param messageData
   */
  @SubscribeMessage('fightMessage')
  handleFightMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    messageData: { fightRoom: string; memberName: string; message: string },
  ) {
    const message = `[${messageData.memberName}]-${messageData.message}`;
    client.emit('fightMessage', message);
    client.to(messageData.fightRoom).emit('fightMessage', message);
  }

  /**
   * 길드 멤버 Online
   * @param clinet
   * @param data
   */
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
    roomData: {
      members: MatchMembers;
      roomName: string;
      memberCount: number;
      status: string;
    },
  ) {
    const newRoom: WaitingRoom = {
      members: [roomData.members],
      roomName:
        roomData.members.member.memberGuild.guildName + '-' + roomData.roomName,
      memberCount: roomData.memberCount,
      status: roomData.status,
    };

    let isDuplicate = false;

    if (newRoom != undefined) {
      this.guildWaitingRoom.forEach((room) => {
        if (
          room.roomName ===
          roomData.members.member.memberGuild.guildName +
            '-' +
            roomData.roomName
        ) {
          isDuplicate = true;
        }
      });

      if (!isDuplicate) {
        client.join(newRoom.roomName);
        this.guildWaitingRoom.push(newRoom);
        console.log(this.guildWaitingRoom);
        client.emit('createRoom', newRoom);
      }
    }
  }

  /**
   * 길드전 방 삭제
   * @param client
   * @param data
   */
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomName: string;
      matchMember: MatchMembers;
    },
  ) {
    const roomIndex = this.guildWaitingRoom.findIndex(
      (room) => room.roomName === data.roomName,
    );

    const room = this.guildWaitingRoom[roomIndex];

    if (room) {
      if (room.memberCount === 1) {
        this.guildWaitingRoom.splice(roomIndex, 1);
        client.emit('leaveRoom', null);
        client.to(room.roomName).emit('leaveRoom', null);

        client.leave(room.roomName);
      } else if (room.roomName.includes(data.matchMember.member.memberName)) {
        client.emit('leaveRoom', null);
        client.to(room.roomName).emit('leaveRoom', null);

        client.leave(room.roomName);

        this.guildWaitingRoom.splice(roomIndex, 1);
      } else {
        room.members = room.members.filter(
          (members) =>
            members.member.memberName != data.matchMember.member.memberName,
        );
        room.memberCount--;

        client.leave(room.roomName);
        client.emit('leaveRoom', room);
        client.to(room.roomName).emit('leaveRoom', room);
      }
    }
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
      matchMember: MatchMembers;
    },
  ) {
    const room = this.guildWaitingRoom.find(
      (room) => room.roomName === data.roomName,
    );
    if (room) {
      if (room.memberCount < 5) {
        room.members.push(data.matchMember);
        room.memberCount++;
        client.join(room.roomName);
        client.emit('joinRoom', room);
        client.to(data.roomName).emit('joinRoom', room);

        console.log(room);
      } else {
        console.log('Room is Full');
        client.emit('joinRoom', 'full');
      }
    }
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
    let me: WaitingRoom;
    for (const room of this.guildWaitingRoom) {
      if (room.roomName === data.roomName) {
        me = room;
        // me 객체를 찾았으면 isReady 속성을 false로 설정
        const updatedMembers = me.members.map((member) => ({
          ...member,
          isReady: false,
          isLeader: false,
        }));
        me.members = updatedMembers;
        // guildWaitingRoom 배열에서 해당 방의 인덱스를 찾아 업데이트
        const index = this.guildWaitingRoom.findIndex(
          (room) => room.roomName === data.roomName,
        );
        if (index !== -1) {
          this.guildWaitingRoom[index] = me;
        }
        break;
      }
    }

    // 내가 속한 방을 찾는데 team_A이랑 team_B가 다 있다면 => 다시 돌린다.
    const existingRoomIndex = this.guildFightingRoom.findIndex((fightRoom) => {
      return (
        (fightRoom.team_A === me || fightRoom.team_B === me) &&
        fightRoom.team_A &&
        fightRoom.team_B
      );
    });

    if (existingRoomIndex !== -1) {
      //다시 돌리는 로직 => 나를 현재 방에서 제외한후 상대가 team_B라면 team_A으로 옮기고 나는 다시 team_B가 비어있는 방을 찾는다.
      //내가 team_A이라면
      if (
        this.guildFightingRoom[existingRoomIndex].team_A.roomName == me.roomName
      ) {
        console.log('다시돌린다. 내가 team_A일때');
        this.guildFightingRoom[existingRoomIndex].team_A =
          this.guildFightingRoom[existingRoomIndex].team_B;
        this.guildFightingRoom[existingRoomIndex].team_B = null;
        //이전에 내가 속해있는 방에다가 내가 나갔다는걸 알리고
        client
          .to(this.guildFightingRoom[existingRoomIndex].fightRoomName)
          .emit('searchFight', this.guildFightingRoom[existingRoomIndex]);

        client
          .to(data.roomName)
          .emit('searchFight', this.guildFightingRoom[existingRoomIndex]);

        client.leave(this.guildFightingRoom[existingRoomIndex].fightRoomName);
        //그방을 없에버려
        this.guildFightingRoom.splice(existingRoomIndex, 1);

        this.matchMaking(client, me);
      } else {
        console.log('다시돌린다. 내가 team_B일때');
        console.log(me.members);
        this.guildFightingRoom[existingRoomIndex].team_B = null;

        //이전에 내가 속해있는 방에다가 내가 나갔다는걸 알리고
        client
          .to(this.guildFightingRoom[existingRoomIndex].fightRoomName)
          .emit('searchFight', this.guildFightingRoom[existingRoomIndex]);

        client
          .to(data.roomName)
          .emit('searchFight', this.guildFightingRoom[existingRoomIndex]);

        client.leave(this.guildFightingRoom[existingRoomIndex].fightRoomName);
        //그방을 없에버려
        this.guildFightingRoom.splice(existingRoomIndex, 1);

        this.matchMaking(client, me);
      }
    } else {
      //만약 team_B가 비어있는 방이있다? => 누군가 매칭을 돌리고 있다.
      this.matchMaking(client, me);
    }
  }

  /**
   * 매칭 취소
   * @param client
   * @param data
   */
  @SubscribeMessage('searchCancel')
  handlesearchCancel(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomName: string;
    },
  ) {
    const index = this.guildFightingRoom.findIndex(
      (fightGuild) => fightGuild.fightRoomName === data.roomName,
    );

    if (this.guildFightingRoom[index]?.team_A) {
      const waitingIndex = this.guildWaitingRoom.findIndex(
        (waitingGuild) =>
          waitingGuild.roomName ===
          this.guildFightingRoom[index]?.team_A.roomName,
      );
      this.guildWaitingRoom[waitingIndex].status = '대기중';
      this.guildWaitingRoom[waitingIndex].members[0].isLeader = false;
      console.log(this.guildWaitingRoom[waitingIndex]);
      client.emit('searchCancel', this.guildWaitingRoom[waitingIndex]);
      client
        .to(this.guildFightingRoom[index].team_A.roomName)
        .emit('searchCancel', this.guildWaitingRoom[waitingIndex]);
    }

    if (index !== -1) {
      client
        .to(this.guildFightingRoom[index].fightRoomName)
        .emit('searchCancel');

      this.guildFightingRoom.splice(index, 1);
      console.log('searchCancel', this.guildFightingRoom);
    } else {
      console.log('error');
    }
  }

  /**
   * 길드 내전 준비 완료
   * @param client
   * @param data
   */
  @SubscribeMessage('readyFight')
  handleReadyFight(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      fightRoom: string;
      memberName: string;
    },
  ) {
    for (const fightRoom of this.guildFightingRoom) {
      if (fightRoom.fightRoomName === data.fightRoom) {
        console.log(fightRoom.team_A.members);
        fightRoom.readyCount++;

        const teamAMemberIndex = fightRoom.team_A.members.findIndex(
          (member) => member.member.memberName === data.memberName,
        );
        const teamBMemberIndex = fightRoom.team_B.members.findIndex(
          (member) => member.member.memberName === data.memberName,
        );

        if (teamAMemberIndex !== -1) {
          fightRoom.team_A.members[teamAMemberIndex].isReady = true;
        } else if (teamBMemberIndex !== -1) {
          fightRoom.team_B.members[teamBMemberIndex].isReady = true;
        } else {
          console.log(
            '[ERROR] - Team_A 또는 Team_B에서 Member를 찾을 수 없음.',
          );
        }
        client.emit('readyFight', fightRoom);
        client.to(fightRoom.fightRoomName).emit('readyFight', fightRoom);
        console.log(fightRoom);
      }
    }
  }

  /**
   * 길드 내전 준비 취소
   * @param client
   * @param data
   */
  @SubscribeMessage('cancelReady')
  handleCancelReady(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      fightRoom: string;
      memberName: string;
    },
  ) {
    for (const fightRoom of this.guildFightingRoom) {
      if (fightRoom.fightRoomName === data.fightRoom) {
        fightRoom.readyCount--;

        const teamAMemberIndex = fightRoom.team_A.members.findIndex(
          (member) => member.member.memberName === data.memberName,
        );
        const teamBMemberIndex = fightRoom.team_B.members.findIndex(
          (member) => member.member.memberName === data.memberName,
        );

        if (teamAMemberIndex !== -1) {
          fightRoom.team_A.members[teamAMemberIndex].isReady = false;
        } else if (teamBMemberIndex !== -1) {
          fightRoom.team_B.members[teamBMemberIndex].isReady = false;
        } else {
          console.log(
            '[ERROR] - Team_A 또는 Team_B에서 Member를 찾을 수 없음.',
          );
        }
        client.emit('cancelReady', fightRoom);
        client.to(fightRoom.fightRoomName).emit('cancelReady', fightRoom);
        console.log(fightRoom);
      }
    }
  }

  /**
   * 긷드 내전 시작
   * @param client
   * @param data
   */
  @SubscribeMessage('startFight')
  handleStartFight(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      fightRoom: string;
    },
  ) {
    for (const fightRoom of this.guildFightingRoom) {
      if (fightRoom.fightRoomName === data.fightRoom) {
        //@todo 주석해제
        // if (fightRoom.readyCount === 10) {//10명다 준비 됬을때
        if (fightRoom.readyCount === 2) {
          //디버깅용
          console.log(
            '시작한다 : ' +
              fightRoom.fightRoomName +
              '팀1 : ' +
              fightRoom.team_A.roomName +
              '팀2 : ' +
              fightRoom.team_B.roomName,
          );
          fightRoom.status = '게임중';
          fightRoom.team_A.status = '게임중';
          fightRoom.team_B.status = '게임중';

          client.emit('startFight', fightRoom);
          client.to(fightRoom.fightRoomName).emit('startFight', fightRoom);
        } else {
          console.log(
            '[ERROR] - ReadyCount가 10이 되지않음 : ' + fightRoom.readyCount,
          );
        }
      }
    }
  }

  /**
   * 길드 내전방 리스트
   * @param client
   * @param data
   */
  @SubscribeMessage('roomList')
  handleRoomList(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      guildName: string;
    },
  ) {
    const guildWaitingList = Array.from(this.guildWaitingRoom).filter((room) =>
      room.roomName.startsWith(data.guildName + '-'),
    );
    console.log('Waiting Room List : ', guildWaitingList);
    client.emit('roomList', guildWaitingList);
  }

  @SubscribeMessage('changeTeam')
  handleChangeTeam(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      fightRoomName: string;
    },
  ) {
    console.log('매칭방리스트', this.guildFightingRoom);
    const fightRoomIndex = this.guildFightingRoom.findIndex(
      (room) => room.fightRoomName === data.fightRoomName,
    );
    if (fightRoomIndex !== -1) {
      console.log('변경전', this.guildFightingRoom[fightRoomIndex]);
      //배열 비구조화 할당
      [
        this.guildFightingRoom[fightRoomIndex].team_A,
        this.guildFightingRoom[fightRoomIndex].team_B,
      ] = [
        this.guildFightingRoom[fightRoomIndex].team_B,
        this.guildFightingRoom[fightRoomIndex].team_A,
      ];

      this.guildFightingRoom[fightRoomIndex].team_B.members.forEach(
        (member) => (member.isLeader = false),
      );
      this.guildFightingRoom[fightRoomIndex].team_A.members[0].isLeader = true;

      console.log('변경후', this.guildFightingRoom[fightRoomIndex]);

      client.emit('changeTeam', this.guildFightingRoom[fightRoomIndex]);
      client
        .to(this.guildFightingRoom[fightRoomIndex].fightRoomName)
        .emit('changeTeam', this.guildFightingRoom[fightRoomIndex]);
    } else {
      console.log('[ERROR] - fightRoomIndex를 찾을 수 없음.');
    }
  }

  //========================================================================//
  //Function
  //========================================================================//

  matchMaking(socket: Socket, me: WaitingRoom): void {
    const meGuildName = me.roomName.split('-')[0];
    const emptyIndexs: number[] = [];
    // team_B가 비어있는 방의 인덱스를 찾아 emptyIndices 배열에 추가
    this.guildFightingRoom.forEach((fightRoom, index) => {
      const teamAGuildName = fightRoom.team_A.roomName.split('-')[0];
      if (!fightRoom.team_B && meGuildName !== teamAGuildName) {
        emptyIndexs.push(index);
      }
    });
    const emptyIndex =
      emptyIndexs[Math.floor(Math.random() * emptyIndexs.length)];

    me.status = '매칭중';

    if (emptyIndexs.length > 0) {
      //내가 돌리고있는 길드의 team_B로 들어간다.
      this.guildFightingRoom[emptyIndex].team_B = me;
      this.guildFightingRoom[emptyIndex].team_A.members[0].isLeader = true;
      console.log('매칭완료 \n', this.guildFightingRoom);
      socket.emit('searchFight', this.guildFightingRoom[emptyIndex]);
      socket.join(this.guildFightingRoom[emptyIndex].fightRoomName);
      socket
        .to(this.guildFightingRoom[emptyIndex].fightRoomName)
        .emit('searchFight', this.guildFightingRoom[emptyIndex]);

      socket
        .to(this.guildFightingRoom[emptyIndex].team_A.roomName)
        .emit('searchFight', this.guildFightingRoom[emptyIndex]);

      socket
        .to(this.guildFightingRoom[emptyIndex].team_B.roomName)
        .emit('searchFight', this.guildFightingRoom[emptyIndex]);
    } else {
      //아무도 없으면 내가 방을 판다.
      const randomString = CommonUtil.uuidv4();
      const fightRoom: FightingRoom = {
        fightRoomName: randomString,
        team_A: me,
        team_B: null,
        readyCount: 0,
        status: '매칭중',
      };
      this.guildFightingRoom.push(fightRoom);
      console.log('빈 방 생성 \n', this.guildFightingRoom);
      socket.join(fightRoom.fightRoomName);
      socket.emit('searchFight', fightRoom);
      socket.to(me.roomName).emit('searchFight', fightRoom);
    }
  }

  updateFightRoomStatus(fightRoomName: string): void {
    const roomIndex = this.guildFightingRoom.findIndex(
      (room) => room.fightRoomName === fightRoomName,
    );
    const teamAIndex = this.guildWaitingRoom.findIndex(
      (room) =>
        (room.roomName = this.guildFightingRoom[roomIndex].team_A.roomName),
    );
    const teamBIndex = this.guildWaitingRoom.findIndex(
      (room) =>
        (room.roomName = this.guildFightingRoom[roomIndex].team_B.roomName),
    );
    this.guildWaitingRoom[teamAIndex].status = '대기중';
    // this.guildWaitingRoom[teamAIndex].members.forEach(
    //   (member) => (member.isReady = false),
    // );

    this.guildWaitingRoom[teamBIndex].status = '대기중';
    // this.guildWaitingRoom[teamBIndex].members.forEach(
    //   (member) => (member.isReady = false),
    // );

    this.guildFightingRoom[roomIndex].status = '대기중';
    // this.guildFightingRoom[roomIndex].team_A.members.forEach(
    //   (member) => (member.isReady = false),
    // );
    // this.guildFightingRoom[roomIndex].team_B.members.forEach(
    //   (member) => (member.isReady = false),
    // );
  }
}
