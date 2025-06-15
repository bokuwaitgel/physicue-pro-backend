import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateExerciseDto {
  @IsNotEmpty()
  @ApiProperty()
  name: string;
  @IsNotEmpty()
  @ApiProperty()
  day: string;
  @IsNotEmpty()
  @ApiProperty()
  level: string;  // beginner, intermediate, advanced
  @IsNotEmpty()
  @ApiProperty()
  type : string; // strength, cardio, flexibility
  @IsNotEmpty()
  courseId: string;
}

export class UpdateExerciseDto {
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
  day: number;

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


export class checkExerciseDto {
  @IsNotEmpty()
  @ApiProperty()
  exerciseId: string;
  @IsNotEmpty()
  @ApiProperty()
  courseId: string;
}