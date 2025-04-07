import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Post,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
  

  import { JwtAuthGuard } from './jwt-auth.guard';

  import { 
    LoginUserDto,
    RefreshTokenDto,
    CreateUserDto,
    ChangePasswordDto,
    ResetPasswordDto,
    verifyTokenDto,
  } from './auth.dtos';
import { AuthService } from './auth.service';
  

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    
      ) {}

    @Post('login')
    public async login(@Body() loginUserDto: LoginUserDto): Promise<any> {
        console.log(loginUserDto);
        return await this.authService.login(loginUserDto);
    }

    @Post('refresh')
    public async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<any> {
        return await this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
    }

    @Post('validateToken')
    async validateToken(@Body() token: verifyTokenDto) {
        try {
        return this.authService.verifyToken(token);
        } catch (e) {
        return new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
        }
    }

    @Post('register')
    public async register(@Body() createUserDto: CreateUserDto): Promise<any> {
      const result = await this.authService.register(
        createUserDto,
      );
      return result;
    }

}
