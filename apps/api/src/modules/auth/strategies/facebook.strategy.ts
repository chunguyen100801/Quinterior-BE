import { Profile, Strategy } from 'passport-facebook';

import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('auth.facebookClientID'),
      clientSecret: configService.getOrThrow<string>(
        'auth.facebookClientSecret',
      ),
      callbackURL: configService.getOrThrow<string>('auth.facebookCallbackURL'),
      scope: 'email',
      profileFields: ['id', 'emails', 'name'],
    });
  }

  async validate(profile: Profile): Promise<{ profile: Profile }> {
    return { profile };
  }
}
