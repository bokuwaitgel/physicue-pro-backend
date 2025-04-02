import {
    Injectable,
    ExecutionContext,
    HttpException,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  
  @Injectable()
  export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
      return super.canActivate(context);
    }
    handleRequest(err, user, info) {
      if (err || !user) {
        throw err || new HttpException({ message: 'Invalid token' }, 401);
      }
      return user;
    }
  }
  