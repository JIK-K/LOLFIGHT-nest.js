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
  NO_REQUIRED_DATA: new CommonCode(
    HttpStatus.BAD_REQUEST,
    'COM001',
    '필수 정보가 없습니다.',
  ),
  NO_DATA: new CommonCode(
    HttpStatus.BAD_REQUEST,
    'COM002',
    '없는 데이터입니다.',
  ),

  EXIST_DATA: new CommonCode(
    HttpStatus.BAD_REQUEST,
    'COM001',
    '존재하는 데이터입니다',
  ),

  INTERNAL_SERVER_ERROR: new CommonCode(
    HttpStatus.INTERNAL_SERVER_ERROR,
    'ERR5001',
    '서버에서 오류가 발생했습니다.',
  ),

  UNSUPPORTED_FILE_TYPE: new CommonCode(
    HttpStatus.BAD_REQUEST,
    'FLE001',
    '잘못된 파일 형식입니다.',
  ),
};
