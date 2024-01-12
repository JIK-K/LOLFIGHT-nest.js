import { v4 } from 'uuid';

export class CommonUtil {
  static isValid(value: any) {
    if (value !== null && value !== undefined && !Number.isNaN(value)) {
      return true;
    } else {
      return false;
    }
  }

  static uuidv4(): string {
    return v4();
  }
}
