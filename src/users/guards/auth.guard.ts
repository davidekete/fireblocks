import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { verifyToken } from '../../utils/tokens.utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  private readonly ACCESS_TOKEN_SECRET = this.config.get('ACCESS_TOKEN_SECRET');

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const token =
      this.extractTokenFromHeader(request) ||
      this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException(
        "You don't have an access token. Please login.",
      );
    }

    try {
      const payload = verifyToken(token, this.ACCESS_TOKEN_SECRET);

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Invalid Access Token. Please login.');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.signedCookies.accessToken;
  }
}
