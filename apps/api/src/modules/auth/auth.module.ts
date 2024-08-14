import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { MailModule } from '../mail/mail.module';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { PublicStrategy } from './strategies/public.strategy';
import { RedisModule } from '@datn/redis';
import { UserModule } from '../user/user.module';
import { SellerModule } from '../seller/seller.module';
import { CartModule } from '../cart/cart.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    MailModule,
    RedisModule,
    UserModule,
    SellerModule,
    CartModule,
    TokenModule,
  ],
  providers: [
    LocalStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    FacebookStrategy,
    GoogleStrategy,
    AuthService,
    PublicStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
