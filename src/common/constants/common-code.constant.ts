import { HttpStatus } from '@nestjs/common';

export class CommonCode {
  constructor(status: number, code: string, message: string) {
    this._status = status;
    this._code = code;
    this._message = message;
  }

  private _status: number;
  public get status(): number {
    return this._status;
  }
  public set status(value: number) {
    this._status = value;
  }

  private _code: string;
  public get code(): string {
    return this._code;
  }
  public set code(value: string) {
    this._code = value;
  }

  private _message: string;
  public get message(): string {
    return this._message;
  }
  public set message(value: string) {
    this._message = value;
  }
}

export const CODE_CONSTANT = {
  // 4XX
  NO_REQUIRED_FIELD: new CommonCode(
    HttpStatus.BAD_REQUEST,
    'COM001',
    '필수 정보가 없습니다.',
  ),
  NO_DATA: new CommonCode(
    HttpStatus.BAD_REQUEST,
    'COM002',
    '없는 데이터입니다.',
  ),

  // 코드 관련 에러
  WRONG_CODE_DEPTH: new CommonCode(
    HttpStatus.BAD_REQUEST,
    'CDE001',
    '잘못된 코드 단계입니다.',
  ),

  // 관리자 관련 에러
  ID_NOT_PRESENT: new CommonCode(
    HttpStatus.BAD_REQUEST,
    'ADM001',
    '없는 ID 입니다.',
  ),
  WRONG_AUTH_INFO: new CommonCode(
    HttpStatus.BAD_REQUEST,
    'ADM002',
    '잘못된 인증 정보 입니다.',
  ),

  // 파일 관련 에러
  UNSUPPORTED_FILE_TYPE: new CommonCode(
    HttpStatus.BAD_REQUEST,
    'FLE001',
    '잘못된 파일 형식입니다.',
  ),

  // 폴더 관련 에러
  DIRECTORY_ALREADY_EXISTS: new CommonCode(
    HttpStatus.BAD_REQUEST,
    'DIR001',
    '이미 있는 폴더입니다.',
  ),

  //5XX
  INTERNAL_SERVER_ERROR: new CommonCode(
    HttpStatus.INTERNAL_SERVER_ERROR,
    'ERR5001',
    '서버에서 오류가 발생했습니다.',
  ),
};
