import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateExerciseDto {
  @IsNotEmpty()
  @ApiProperty()
  name: string;
  @IsNotEmpty()
  @ApiProperty()
  description: string;
  @IsNotEmpty()
  @ApiProperty()
  purpose: string;
  @IsNotEmpty()
  @ApiProperty()
  duration: number;

  @IsNotEmpty()
  @ApiProperty()
  level: string;  // beginner, intermediate, advanced
  @IsNotEmpty()
  @ApiProperty()
  type : string; // strength, cardio, flexibility

  @IsNotEmpty()
  @ApiProperty()
  image: string;
  @IsNotEmpty()
  @ApiProperty()
  video: string;

  @IsNotEmpty()
  @ApiProperty()
  teacherId: string;
}

export class UpdateExerciseDto {
  @IsNotEmpty()
  @ApiProperty()
  id: string;
  @IsNotEmpty()
  @ApiProperty()
  name: string;
  @IsNotEmpty()
  @ApiProperty()
  description: string;
  @IsNotEmpty()
  @ApiProperty()
  image: string;
  @IsNotEmpty()
  @ApiProperty()
  video: string;
  @IsNotEmpty()
  @ApiProperty()
  type: string;
}

export class deleteExerciseDto {
  @IsNotEmpty()
  @ApiProperty()
  id: string;
}


export class getExerciseByIdDto {
  @IsNotEmpty()
  @ApiProperty()
  id: string;
}

export class addExerciseToCourseDto {
  @IsNotEmpty()
  @ApiProperty()
  teacherId: string;
  @IsNotEmpty()
  @ApiProperty()
  courseId: string;
  @IsNotEmpty()
  @ApiProperty()
  exerciseId: string;
}
