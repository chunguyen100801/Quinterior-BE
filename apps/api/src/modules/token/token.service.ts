import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ApiDataService } from '@datn/prisma';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import crypto from 'crypto';
import { TokenKey, User } from '@prisma/db-api';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TOKEN_KEY_MESSAGES } from '@datn/shared';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<ApiDataService>
    >,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async signToken({ user }: { user: User }) {
    this.logger.log('Sign token');
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
    });

    const { id: tokenKeyId } = await this.txHost.tx.tokenKey.create({
      data: {
        userId: user.id,
        publicKey: publicKey,
      },
    });

    const accessToken: string = this.signAccessToken(
      {
        tokenKeyId: tokenKeyId,
      },
      privateKey,
    );

    const refreshToken: string = this.signRefreshToken(
      {
        tokenKeyId: tokenKeyId,
      },
      privateKey,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async removeTokenKey(tokenKeyId: number): Promise<void> {
    await this.txHost.tx.tokenKey.delete({
      where: {
        id: tokenKeyId,
      },
    });
  }

  signEmailVerifyToken(email: string): string {
    return this.jwtService.sign(
      { email },
      {
        secret: this.config.getOrThrow('mail.jwtMailSecret'),
        expiresIn: `${this.config.getOrThrow('mail.jwtMailExpires')}s`,
      },
    );
  }

  signForgotPasswordToken({ userId }: { userId: number }) {
    return this.jwtService.sign(
      { userId },
      {
        secret: this.config.getOrThrow<string>('auth.jwtForgotPasswordSecret'),
        expiresIn: `${this.config.getOrThrow<string>(
          'auth.jwtForgotPasswordExpires',
        )}s`,
      },
    );
  }

  async getTokenKey(tokenKeyId: number): Promise<TokenKey> {
    const tokenKey = await this.txHost.tx.tokenKey.findUnique({
      where: {
        id: tokenKeyId,
      },
    });

    if (!tokenKey)
      throw new NotFoundException(TOKEN_KEY_MESSAGES.TOKEN_KEY_NOT_FOUND);

    return tokenKey;
  }

  private signRefreshToken(
    { tokenKeyId }: { tokenKeyId: number },
    privateKey: string,
  ) {
    return this.jwtService.sign(
      { id: tokenKeyId },
      {
        secret: privateKey,
        // change expires unit to seconds
        expiresIn:
          this.config.getOrThrow<number>('auth.refreshTokenExpires') + 's',
        algorithm: 'RS256',
      },
    );
  }

  private signAccessToken(
    { tokenKeyId }: { tokenKeyId: number },
    privateKey: string,
  ) {
    return this.jwtService.sign(
      { id: tokenKeyId },
      {
        secret: privateKey,
        // change expires unit to seconds
        expiresIn:
          this.config.getOrThrow<number>('auth.accessTokenExpires') + 's',
        algorithm: 'RS256',
      },
    );
  }
}
