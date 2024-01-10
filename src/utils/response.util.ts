import { ResponseDTO } from 'src/common/DTOs/response.dto';

export class ResponseUtil {
  static makeSuccessResponse<T>(data: T): ResponseDTO<T> {
    const responseDTO: ResponseDTO<T> = new ResponseDTO<T>();
    responseDTO.setSuccess(data);

    return responseDTO;
  }
}
