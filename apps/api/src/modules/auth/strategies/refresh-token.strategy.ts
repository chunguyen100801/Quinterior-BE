import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from '../auth.interface';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/db-api';
import { UserService } from '../../user/user.service';
import { TokenService } from '../../token/token.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (
        _request: Express.Request,
        jwtToken: string,
        done: (exception: null | HttpException, secret?: string) => unknown,
      ): Promise<void> => {
        const decodedToken = jwt.decode(jwtToken) as {
          id: number;
        };
        try {
          const tokenKey = await tokenService.getTokenKey(decodedToken.id);
          done(null, tokenKey.publicKey);
        } catch {
          done(
            new UnauthorizedException(
              'An exception occurred while validating your token. Please log in again.',
            ),
          );
        }
      },
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: JwtPayload) {
    const tokenKey = await this.tokenService.getTokenKey(payload.id);

    const user: User = await this.userService.getUserById(tokenKey.userId);

    return {
      ...user,
      tokenId: tokenKey.id,
    };
  }
}
