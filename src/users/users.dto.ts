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

export class CreateUserDto {
    @IsNotEmpty()
    @ApiProperty()
    firebaseId: string;
    @IsNotEmpty()
    @ApiProperty()
    firebaseToken: string;
    @IsNotEmpty()
    @ApiProperty()
    fcmToken: string;
    @IsNotEmpty()
    @ApiProperty()
    firstName: string;
    @IsNotEmpty()
    @ApiProperty()
    lastName: string;
    @IsNotEmpty()
    @ApiProperty()
    email: string;
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

export class loginUserDto {
    @IsNotEmpty()
    @ApiProperty()
    firebaseId: string;
    @IsNotEmpty()
    @ApiProperty()
    fcmToken: string;
    @ApiProperty()
    @IsNotEmpty()
    firebaseToken: string;
}

export class logoutUserDto {
    @IsNotEmpty()
    @ApiProperty()
    firebaseId: string;
}

export class createTeacherDto {
    @IsNotEmpty()
    @ApiProperty()
    firebaseId: string;
    @IsNotEmpty()
    @ApiProperty()
    description: string;
}

export class updateTeacherDto {
    @IsNotEmpty()
    @ApiProperty()
    description: string;
    @ApiProperty()
    status: string;
}

export class FileUploadDto {
    @IsNotEmpty()
    @ApiProperty()
    firebaseId: string;
    @IsNotEmpty()
    @ApiProperty({ type: 'string', format: 'binary', required: true })
    file: Express.Multer.File;
  }

