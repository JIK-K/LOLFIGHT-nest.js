import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('api')
export class FileController {
  @Get('download-setup-file')
  downloadSetupFile(@Res() res: Response) {
    console.log(__dirname);
    const filePath = path.resolve(
      path.join(
        __dirname,
        '..',
        '..',
        'public',
        'files',
        'lolfight-desktop-0.0.1 Setup.exe',
      ),
    );
    console.log(filePath);
    // 경로 검증 및 파일 존재 여부 확인
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition':
          'attachment; filename=lolfight-desktop-0.0.1 Setup.exe',
      });

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  }
}
