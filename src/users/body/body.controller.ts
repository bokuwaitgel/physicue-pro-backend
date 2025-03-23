import { Body, Controller, Delete, Get, Post, Put, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { BodyService } from './body.service';

//dtos
import { 
  CreateBodyDto,
  UpdateBodyDto,
} from './body.dto';

@ApiTags('body')
@Controller('body')
export class BodyController {
  constructor(private readonly bodyService: BodyService) {}

  @Post('createBody')
  @ApiOperation({ summary: 'Create body' })
  @ApiResponse({ status: 200, description: 'Data' })
  public async createBody(@Body() data: CreateBodyDto) {
    return this.bodyService.create(data);
  }

  @Get('getBody/:userId')
  @ApiOperation({ summary: 'Get body' })
  @ApiResponse({ status: 200, description: 'Data' })
  public async getBody(@Param('userId') userId: string) {
    return this.bodyService.getBody(userId);
  }


  @Put('updateBody')
  @ApiOperation({ summary: 'Update body' })
  @ApiResponse({ status: 200, description: 'Data' })
  public async updateBody(@Body() data: UpdateBodyDto) {
    return this.bodyService.update(data);
  }
}
