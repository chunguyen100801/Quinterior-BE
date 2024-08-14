import { BadRequestException, Injectable } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { USERS_MESSAGES } from '@datn/shared';
import { User } from '@prisma/db-api';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<User> {
    const user = await this.authService.validateUserLoginRequest(
      email,
      password,
    );

    if (user.isActive != true)
      throw new BadRequestException(USERS_MESSAGES.VERIFY_TOKEN_BEFORE_LOGIN);

    return user;
  }
}
