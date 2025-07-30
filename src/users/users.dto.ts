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
  gender: string;

  @ApiProperty()
  workoutRepeat: string;

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
    userId: string;
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
    persona: BodyDto;
}

export class loginUserDto {
    @IsNotEmpty()
    @ApiProperty()
    userId: string;
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
    userId: string;
}

export class createTeacherDto {
    @IsNotEmpty()
    @ApiProperty()
    userId: string;
    @ApiProperty()
    description: string;
    @ApiProperty()
    phone: string;
    @ApiProperty()
    aboutMe: string;
    @ApiProperty()
    experience: string;
    @ApiProperty()
    name: string;
}

export class updateTeacherDto {
    @IsNotEmpty()
    @ApiProperty()
    description: string;
    @IsNotEmpty()
    @ApiProperty()
    phone: string;
    @ApiProperty()
    aboutMe: string;
    @ApiProperty()
    experience: string;
    @ApiProperty()
    status: string;
    @ApiProperty()
    name: string;
}



export class FileUploadDto {
    @IsNotEmpty()
    @ApiProperty()
    userId: string;
    @IsNotEmpty()
    @ApiProperty({ type: 'string', format: 'binary', required: true })
    file: Express.Multer.File;
  }


  export class createSubPlanDto {
    @IsNotEmpty()
    @ApiProperty()
    planName: string;
    @IsNotEmpty()
    @ApiProperty()
    cost: string;
    @IsNotEmpty()
    @ApiProperty()
    duration: string;
    @ApiProperty()
    description: string;
    @ApiProperty()
    image: string;
  }

export class updateSubPlanDto {
    @IsNotEmpty()
    @ApiProperty()
    planName: string;
    @IsNotEmpty()
    @ApiProperty()
    cost: string;
    @IsNotEmpty()
    @ApiProperty()
    duration: string;
    @ApiProperty()
    description: string;
    @ApiProperty()
    image: string;
}

