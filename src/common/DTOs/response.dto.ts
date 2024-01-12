import { BaseDTO } from 'src/base/base.dto';
import { CommonCode } from 'src/common/constants/common-code.constant';
import { BooleanType } from 'src/types/boolean.type';

export class ResponseDTO<T> {
  constructor() {}

  isSuccess: BooleanType;
  code: string;
  message: string;
  count: number;
  data: T;

  setFailed(code: CommonCode): void {
    this.isSuccess = BooleanType.FALSE;
    this.code = code.code;
    this.message = code.message;
    this.count = 0;
    this.data = null;
  }

  setSuccess(data: T): void {
    this.isSuccess = BooleanType.TRUE;
    this.code = '';
    this.message = '';
    this.count = Array.isArray(data) ? data.length : 1;
    this.data = data;
  }
}
