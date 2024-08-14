import { CartService } from '../cart/cart.service';
import { UserService } from '../user/user.service';

import {
  ContextProvider,
  IOAuthRequest,
  IUserRequest,
  USERS_MESSAGES,
  UserWithTokenKeyId,
} from '@datn/shared';
import { RedisServiceAbstract } from '@datn/redis';
import { ApiDataService } from '@datn/prisma';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/db-api';
import { generateHash, validateHash } from '../../utils';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { ResendVerifyEmailDto } from './dto/resend-verify-email.dto';
import { omit } from 'lodash';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { SellerService } from '../seller/seller.service';
import { TokenService } from '../token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: ApiDataService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
    private readonly redisService: RedisServiceAbstract,
    private readonly userService: UserService,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<ApiDataService>
    >,
    private readonly sellerService: SellerService,
    private readonly cartService: CartService,
    private readonly tokenService: TokenService,
  ) {}

  @Transactional<TransactionalAdapterPrisma>()
  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const checkExistEmail: boolean = await this.userService.isEmailTaken(email);

    if (checkExistEmail)
      throw new BadRequestException(USERS_MESSAGES.EMAIL_ALREADY_EXISTS);

    const hashedPassword = generateHash(password);

    const verifyEmailToken: string =
      this.tokenService.signEmailVerifyToken(email);

    const user = await this.txHost.tx.user.create({
      data: {
        ...registerDto,
        password: hashedPassword,
        verifyEmailToken: verifyEmailToken,
      },
    });

    await this.cartService.createCart(user.id);

    await this.sendVerificationLink({
      email: registerDto.email,
      name: registerDto.firstName + '' + registerDto.lastName,
      token: verifyEmailToken,
    });
  }

  async login(req: IUserRequest) {
    const user: User = req.user;

    const { accessToken, refreshToken } = await this.tokenService.signToken({
      user: user,
    });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async loginFacebook(req: IOAuthRequest) {
    const { profile } = req.user;

    let user = await this.prisma.user.findUnique({
      where: {
        facebookId: profile.id,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          firstName: profile.name.familyName,
          lastName: profile.name.givenName,
          facebookId: profile.id,
          isActive: true,
        },
      });
    }

    return this.tokenService.signToken({ user });
  }

  async loginGoogle(req: IOAuthRequest) {
    const { profile } = req.user;

    let user = await this.prisma.user.findUnique({
      where: { googleId: profile.id },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          firstName: profile.name.familyName,
          lastName: profile.name.givenName,
          googleId: profile.id,
          avatar: profile.photos[0].value,
          isActive: true,
        },
      });
    }

    return this.tokenService.signToken({ user });
  }

  async validateUserLoginRequest(email: string, password: string) {
    const loginFailKey: string = `loginFail-${email}`;
    const loginFailedCountString = (await this.redisService.get(
      loginFailKey,
    )) as number;

    const loginFailedCount: number = loginFailedCountString
      ? loginFailedCountString
      : 0;

    const loginFailLimit = this.config.getOrThrow<number>(
      'throttler.loginFailLimit',
    );

    if (loginFailedCount >= loginFailLimit) {
      throw new UnauthorizedException(
        'You have entered the wrong password too many times. Please try again later.',
      );
    }

    const user: User = await this.userService.getUserByEmail(email);

    const valid: boolean = await validateHash(password, user.password);

    if (!valid) {
      if (loginFailedCount === 0) {
        const loginFailTTL: number = this.config.getOrThrow<number>(
          'throttler.loginFailTTL',
        );

        await this.redisService.set(
          loginFailKey,
          loginFailedCount + 1,
          loginFailTTL,
        );
      } else {
        await this.redisService.incr(loginFailKey);
      }
      throw new UnauthorizedException(
        USERS_MESSAGES.PASSWORD_OR_USERNAME_INCORRECT,
      );
    } else {
      await this.redisService.del(loginFailKey);
    }

    return user;
  }

  async refreshToken({ user, tokenKeyId }: { user: User; tokenKeyId: number }) {
    await this.tokenService.removeTokenKey(tokenKeyId);

    return this.tokenService.signToken({ user });
  }

  @Transactional<TransactionalAdapterPrisma>()
  async verifyEmail(token: string) {
    const payload: {
      email: string;
    } = this.jwtService.verify(token, {
      secret: this.config.getOrThrow<string>('mail.jwtMailSecret'),
      ignoreExpiration: false,
    });

    const user = await this.userService.getUserByEmail(payload.email);

    if (user.isActive)
      throw new BadRequestException(USERS_MESSAGES.ACCOUNT_IS_VERIFIED);

    await this.txHost.tx.user.update({
      where: {
        email: payload.email,
      },
      data: {
        isActive: true,
        verifyEmailToken: null,
      },
    });

    await this.sellerService.createSeller(
      user.id,
      `${user.firstName} ${user.lastName}`,
    );

    const redirectUrl: string =
      this.config.getOrThrow('app.frontendURL') + '/verify-success';

    return {
      url: redirectUrl,
    };
  }

  async resendVerifyEmail(resendVerifyEmailDto: ResendVerifyEmailDto) {
    const user = await this.userService.getUserByEmail(
      resendVerifyEmailDto.email,
    );

    if (user.isActive)
      throw new BadRequestException(USERS_MESSAGES.ACCOUNT_IS_VERIFIED);

    const verifyEmailToken: string = this.tokenService.signEmailVerifyToken(
      user.email,
    );

    await this.sendVerificationLink({
      email: user.email,
      name: user.firstName + user.lastName,
      token: verifyEmailToken,
    });

    await this.prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        verifyEmailToken: verifyEmailToken,
      },
    });
  }

  async getMe(): Promise<Partial<User>> {
    const user: UserWithTokenKeyId = ContextProvider.getAuthUser();

    return omit(user, [
      'password',
      'verifyEmailToken',
      'forgotPasswordToken',
      'facebookId',
      'googleId',
      'role',
      'isActive',
      'tokenId',
    ]);
  }

  async logout() {
    const authUser = ContextProvider.getAuthUser();
    await this.tokenService.removeTokenKey(authUser.tokenId);
  }

  private sendVerificationLink({
    email,
    name,
    token,
  }: {
    email: string;
    name: string;
    token: string;
  }) {
    const apiPrefix: string = this.config.getOrThrow<string>('app.apiPrefix');

    const verifyEmailUrl: string = `${this.config.getOrThrow(
      'app.appURL',
    )}/${apiPrefix}/auth/verify-email?token=${token}`;

    return this.mailService.sendMail({
      to: email,
      from: ' no-reply@company.com',
      subject: 'Please verify your email address',
      template: './verify-mail',
      context: {
        name,
        verifyEmailUrl,
      },
    });
  }
}
