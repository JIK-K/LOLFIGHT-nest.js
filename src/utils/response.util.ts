import { ResponseDTO } from 'src/common/DTOs/response.dto';
import { CODE_CONSTANT } from 'src/common/constants/common-code.constant';

export class ResponseUtil {
  static makeSuccessResponse<T>(data: T): ResponseDTO<T> {
    const responseDTO: ResponseDTO<T> = new ResponseDTO<T>();
    if (data === null || data === undefined) {
      responseDTO.setFailed(CODE_CONSTANT.NO_DATA);
    } else {
      responseDTO.setSuccess(data);
    }

    return responseDTO;
  }
}
