import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

import {
  LoginUserDto,
  ChangePasswordDto,
  ResetPasswordDto,
  CreateUserDto,
  verifyTokenDto,
  GoogleUserDto,
  AppleUserDto,
} from './auth.dtos';
import { JwtPayload } from './jwt.strategy';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async refreshAccessToken(refreshToken: string): Promise<any> {

    const decoded = this.jwtService.verify(refreshToken, {
      secret: process.env.SECRETKEY,
      ignoreExpiration: false,
    }) 
    decoded.exp *= 1000
    const expireDate = new Date(decoded.exp)

    const user = await this.prisma.user.findFirst({
      where: {
        email: decoded.email,
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
        accessToken: tokenAccess.accessToken,
        expiresIn: tokenAccess.expiresIn,
        refreshToken: user.refreshToken,
        refreshTokenExpiry: user.refreshTokenExpiry,
        sub: true,
        userId: user.id,
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
    //update user refresh token
    const userRes = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken: tokenRefresh.refreshToken,
        refreshTokenExpiry: tokenRefresh.refreshTokenExpiry,
      },
    });

    //check fcmToken
    if (loginUserDto.fcmToken && user.fcmToken !== loginUserDto.fcmToken) {
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          fcmToken: loginUserDto.fcmToken,
        },
      });
    }
    
    
    return {
      code: HttpStatus.OK,
      success: true,
      type: 'success',
      data: {
        accessToken: tokenAccess.accessToken,
        expiresIn: tokenAccess.expiresIn,
        refreshToken: tokenRefresh.refreshToken,
        refreshTokenExpiry: tokenRefresh.refreshTokenExpiry,
        sub: true,
        userId: user.id,
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
      const decoded = this.jwtService.verify(token, {
        secret: process.env.SECRETKEY,
        ignoreExpiration: false,
      }) 
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
        email: createUserDto.email,
        firebaseId: createUserDto.firebaseId,
        fcmToken: createUserDto.fcmToken,
        password: hash,
        salt: salt,
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

    const subscription = await this.prisma.subscription.create({
      data: {
        userId: newUser.id,
        tag: 'free',
        status: 'active',
        startDate: new Date(),
        endDate: new Date() // 1 year from now
      },
    });

    const userRes = await this.prisma.user.update({
      where: {
        id: newUser.id,
      },
      data: {
        subscriptionId: subscription.id,
        refreshToken: tokenRefresh.refreshToken,
        refreshTokenExpiry: tokenRefresh.refreshTokenExpiry,
      },
    });


    return {
      code: HttpStatus.OK,
      success: 'true',
      type: 'success',
      message: 'user created successfully',
      data: {
        accessToken: tokenAccess.accessToken,
        expiresIn: tokenAccess.expiresIn,
        refreshToken: tokenRefresh.refreshToken,
        refreshTokenExpiry: tokenRefresh.refreshTokenExpiry,
        userId: newUser.id,
      }
    }
  }

  async googleLogin(googleUserDto: GoogleUserDto): Promise<any> {
    // create google login if user does not exist then register
    const user = await this.prisma.user.findFirst({
      where: {
        // find by firebaseId
        email: googleUserDto.idToken,
      },
    });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(googleUserDto.uuid, salt);
      //register
      const newUser = await this.prisma.user.create({
        data: {
          firstName: 'GoogleUser',
          lastName: 'GoogleUser',
          email: googleUserDto.idToken,
          firebaseId: googleUserDto.idToken,
          fcmToken: googleUserDto.fcmToken,
          password: hash,
          salt: salt,
        },
      }); 
    }

    //login
    return this.login({
      email: googleUserDto.idToken,
      password: googleUserDto.uuid,
      fcmToken: googleUserDto.fcmToken
    });

    
  }
  
  async appleLogin(appleUserDto: AppleUserDto): Promise<any> {
    // create apple login if user does not exist then register
    const user = await this.prisma.user.findFirst({
      where: {
        // find by firebaseId
        email: appleUserDto.identityToken,
      },
    });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(appleUserDto.uuid, salt);
      //register
      const newUser = await this.prisma.user.create({
        data: {
          firstName: 'AppleUser',
          lastName: 'AppleUser',
          email: appleUserDto.identityToken,
          firebaseId: appleUserDto.identityToken,
          fcmToken: appleUserDto.fcmToken,
          password: hash,
          salt: salt,
        },
      }); 
    }

    //login
    return this.login({
      email: appleUserDto.identityToken,
      password: appleUserDto.uuid,
      fcmToken: appleUserDto.fcmToken
    });
  }
}
