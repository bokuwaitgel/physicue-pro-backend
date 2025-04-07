import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { stat } from 'fs';
import { retry } from 'rxjs';
import {ConfigService} from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import jwt from 'jsonwebtoken';

import { UsersService } from '../users/users.service';

import {
  LoginUserDto,
  ChangePasswordDto,
  ResetPasswordDto,
  CreateUserDto,
  verifyTokenDto,
} from './auth.dtos';
import { JwtPayload } from './jwt.strategy';

import bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async refreshAccessToken(refreshToken: string): Promise<any> {
    const decoded = jwt.verify(refreshToken, process.env.SECRETKEY || '') as unknown as {mobile: string, exp: number};
    console.log(decoded.exp)
    decoded.exp *= 1000
    const expireDate = new Date(decoded.exp)

    const user = await this.prisma.user.findFirst({
      where: {
        mobile: decoded.mobile,
      },
    });
    const now = new Date();

    if (now > expireDate) {
      return {
        code: HttpStatus.CONFLICT,
        success: 'false',
        type: 'failed',
        message: 'refresh token expired',
      };
    }
    if (!user) {
      return {
        code: HttpStatus.CONFLICT,
        success: 'false',
        type: 'failed',
        message: 'user does not exist',
      };
    }
    if (user.refreshToken !== refreshToken) {
      return {
        code: HttpStatus.CONFLICT,
        success: 'false',
        type: 'failed',
        message: 'invalid refresh token',
      };
    }
    const tokenAccess = await this._createTokenAccess(user);
    if (!tokenAccess) {
      return {
        code: HttpStatus.CONFLICT,
        success: 'false',
        type: 'failed',
        message: 'refresh token creation failed',
      };
    }

    return {
      code: HttpStatus.OK,
      data: {
        ...tokenAccess,
        user
      },
    };
  }


  async login(loginUserDto: LoginUserDto): Promise<any> {
    const user = await this.usersService.findByLogin(loginUserDto.email);

    if (!user) {
      return {
        code: HttpStatus.CONFLICT,
        success: 'false',
        type: 'failed',
        message: 'user does not exist',
      };
    }
    const tokenAccess = await this._createTokenAccess(user);
    const tokenRefresh = await this._createTokenRefresh(user);
    // let smsSent = false;
    const salt = user.salt;
    const hash = user.password;
    
    const curHash = await bcrypt.hash(loginUserDto.password, salt);
    if(curHash != hash) {
      return {
        code: HttpStatus.CONFLICT,
        success: 'false',
        type: 'failed',
        message: 'Нууц үг буруу.',
      };
    }
    if (!tokenAccess && !tokenRefresh) {
      return {
        code: HttpStatus.CONFLICT,
        success: 'false',
        type: 'failed',
        message: 'refresh token or access token creation failed',
      };
    }

    return {
      code: HttpStatus.OK,
      success: true,
      type: 'success',
      data: {
        refreshToken: tokenRefresh.refreshToken,
        refreshTokenExpiry: tokenRefresh.refreshTokenExpiry,
        accessToken: tokenAccess.accessToken,
        expiresIn: tokenAccess.expiresIn,
      }
    };
  }

  private async _createTokenAccess({ email }): Promise<any> {
    const user: JwtPayload = { email };

    const accessToken = await this.jwtService.signAsync(user, {
      secret: process.env.SECRETKEY,
      expiresIn: process.env.EXPIRESINACCESS,
    });

    const expiresIn = new Date();
    expiresIn.setHours(expiresIn.getHours() + 2);

   
    return {
      accessToken,
      expiresIn,
    };
  }

  private async _createTokenRefresh({ email }): Promise<any> {
    const user: JwtPayload = {
        email
    };

    const refreshToken = await this.jwtService.signAsync(user, {
      secret: process.env.SECRETKEY,
      expiresIn: process.env.EXPIRESINREFRSH,
    });
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 60);

    await this.prisma.user.update({
      where: {
        email: email,
      },
      data: {
        refreshToken: refreshToken,
        refreshTokenExpiry: refreshTokenExpiry,
      },
    });

    return {
      refreshToken,
      refreshTokenExpiry,
    };
  }

  async validateUser(payload: JwtPayload): Promise<any> {
    const user = await this.usersService.findByLogin(payload.email);
    if (!user) {
      throw new HttpException('INVALID_TOKEN', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  async verifyToken(data: verifyTokenDto): Promise<any> {
    try {
      const token = data.token.split(' ')[1];
      const decoded = this.jwtService.verify(token) as { email: string};
      const user = await this.usersService.findByLogin(decoded.email);
      if (!user) {
        return {
          code: HttpStatus.CONFLICT,
          success: 'false',
          type: 'failed',
          message: 'user does not exist',
        };
      }
      return {
        code: HttpStatus.OK,
        success: 'true',
        type: 'success',
        message: 'valid token',
        data: user,
      };
    } catch (err) {
      return {
        code: HttpStatus.CONFLICT,
        success: 'false',
        type: 'failed',
        message: 'invalid token',
      };
    }
  }

  async register(createUserDto: CreateUserDto): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: createUserDto.email,
      },
    });
    if (user) {
      return {
        code: HttpStatus.CONFLICT,
        success: 'false',
        type: 'failed',
        message: 'user already exists',
      };
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(createUserDto.password, salt);

    const newUser = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hash,
        salt,
      },
    });

    const tokenAccess = await this._createTokenAccess(newUser);
    const tokenRefresh = await this._createTokenRefresh(newUser);
    if (!tokenAccess && !tokenRefresh) {
      return {
        code: HttpStatus.CONFLICT,
        success: 'false',
        type: 'failed',
        message: 'refresh token or access token creation failed',
      };
    }

    const userRes = await this.prisma.user.update({
      where: {
        id: newUser.id,
      },
      data: {
        refreshToken: tokenRefresh.refreshToken,
        refreshTokenExpiry: tokenRefresh.refreshTokenExpiry,
      },
    });

    //body
    const body = await this.prisma.bodyHistory.create({
      data: {
        weight: createUserDto.body.weight,
        height: createUserDto.body.height,
        bodyType: createUserDto.body.bodyType,
        age: createUserDto.body.age,
        birthDate: createUserDto.body.birthDate,
        bodyIssue: createUserDto.body.bodyIssue,
        goal: createUserDto.body.goal,
        userId: userRes.id,
      }
    });


    return {
      code: HttpStatus.OK,
      success: 'true',
      type: 'success',
      message: 'user created successfully',
      data: {
        user: {
          ...userRes,
          persona: body
        }
      }
    }
  }
}

export interface RegistrationStatus {
  success: boolean;
  message: string;
  code: number;
  type: string;
  data?: {
    id: string;
    email: string;
    refreshToken: string;
    refreshTokenExpiry: Date;
    accessToken: string;
    expiresIn: string;
  };

  }
export interface RegistrationSeederStatus {
  success: boolean;
  message: string;
  data?: User[];
}