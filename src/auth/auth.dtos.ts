import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class BodyDto {
  @ApiProperty()
  weight: number;

  @ApiProperty()
  height: number;

  @ApiProperty()
  bodyType: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  birthDate: Date;

  @ApiProperty()
  bodyIssue: string;

  @ApiProperty()
  goal: string;
}
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

export class CreateUserDto {
    @IsNotEmpty()
    @ApiProperty()
    email: string;
    @IsNotEmpty()
    @ApiProperty()
    password: string;


    @ApiProperty()
    firebaseId: string;
    @IsNotEmpty()
    @ApiProperty()
    firstName: string;
    @IsNotEmpty()
    @ApiProperty()
    lastName: string;
   
    @ApiProperty()
    profileImage: string;
    @ApiProperty()
    mobile: string;
    @ApiProperty()
    address: string;

    @ApiProperty()
    facebookAcc: string;
    @ApiProperty()
    instagramAcc: string;

    @ApiProperty()
    body: BodyDto;
}


