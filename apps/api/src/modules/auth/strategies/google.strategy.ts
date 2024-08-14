import { Profile, Strategy } from 'passport-google-oauth20';

import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('auth.googleClientID'),
      clientSecret: configService.getOrThrow<string>('auth.googleClientSecret'),
      callbackURL: configService.getOrThrow<string>('auth.googleCallbackURL'),
      scope: ['email', 'profile'],
    });
  }
  async validate(profile: Profile) {
    return { profile };
  }
}
