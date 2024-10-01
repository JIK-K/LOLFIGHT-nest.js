import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthDTO {
  @IsEmail()
  id: string;

  @IsNotEmpty()
  pw: string;
}
