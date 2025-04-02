import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly currentPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly newPassword: string;
}
export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly newPassword: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly refreshToken: string;
}


export class verifyTokenDto {
  @IsNotEmpty()
  @ApiProperty()
  token: string;
}