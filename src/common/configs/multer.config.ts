import { HttpException, HttpStatus } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CODE_CONSTANT } from '../constants/common-code.constant';

export const multerConfig = {
  fileFilter: (request, file, callback) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      // 이미지 형식은 jpg, jpeg, png만 허용합니다.
      callback(null, true);
    } else {
      callback(
        new HttpException(
          CODE_CONSTANT.UNSUPPORTED_FILE_TYPE,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },
  storage: diskStorage({
    destination: (request, file, callback) => {
      const uploadPath = 'public/uploads';
      if (!existsSync(uploadPath)) {
        // uploads 폴더가 존재하지 않을시, 생성합니다.
        mkdirSync(uploadPath);
      }
      callback(null, uploadPath);
    },
    filename: (request, file, callback) => {
      //파일 이름 설정
      callback(null, `${Date.now()}${extname(file.originalname)}`);
    },
  }),
  //   limits: {
  //     fieldNameSize: 200, // 필드명 사이즈 최대값 (기본값 100bytes)
  //     filedSize: 1024 * 1024, // 필드 사이즈 값 설정 (기본값 1MB)
  //     fields: 2, // 파일 형식이 아닌 필드의 최대 개수 (기본 값 무제한)
  //     fileSize: 16777216, //multipart 형식 폼에서 최대 파일 사이즈(bytes) "16MB 설정" (기본 값 무제한)
  //     files: 10, //multipart 형식 폼에서 파일 필드 최대 개수 (기본 값 무제한)
  //   },
};

export const videoConfig = {
  fileFilter: (request, file, callback) => {
    if (file.mimetype.match(/\/(mp4|quicktime)$/)) {
      callback(null, true);
    } else {
      callback(
        new HttpException(
          CODE_CONSTANT.UNSUPPORTED_FILE_TYPE,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },
  storage: diskStorage({
    destination: (request, file, callback) => {
      const exerciseDirName = request.body.exerciseDirName;
      const uploadPath = `public/video/${exerciseDirName}`;
      // const uploadPath = `uploads/${exerciseDirName}`;
      if (!existsSync(uploadPath)) {
        // uploads 폴더가 존재하지 않을시, 생성합니다.
        mkdirSync(uploadPath);
      }
      callback(null, uploadPath);
    },
    filename: (request, file, callback) => {
      //파일 이름 설정
      callback(
        null,
        `${Buffer.from(file.originalname, 'latin1')
          .toString('utf-8')
          .replace(extname(file.originalname), '')}_${Date.now()}${extname(
          file.originalname,
        )}`,
      );
    },
  }),
};
