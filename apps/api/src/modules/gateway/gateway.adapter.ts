import { INestApplicationContext, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { JwtService } from '@nestjs/jwt';
import { ModuleRef } from '@nestjs/core';
import { NextFunction } from 'express';
import { IAuthenticatedSocket } from '@datn/shared';
import { RedisClient } from '@datn/redis';
import { createAdapter } from '@socket.io/redis-adapter';
import jwt from 'jsonwebtoken';
import socketio from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { TokenService } from '../token/token.service';
import { UserService } from '../user/user.service';

export class WebsocketAdapter extends IoAdapter {
  private jwtService: JwtService;
  private userService: UserService;
  private tokenService: TokenService;

  constructor(
    app: INestApplicationContext,
    private moduleRef: ModuleRef,
    private readonly subClient: RedisClient,
    private readonly pubClient: RedisClient,
    private readonly logger = new Logger(WebsocketAdapter.name),
  ) {
    super(app);
    this.jwtService = this.moduleRef.get(JwtService, { strict: false });
    this.userService = this.moduleRef.get(UserService, { strict: false });
    this.tokenService = this.moduleRef.get(TokenService, { strict: false });
  }

  createIOServer(
    port: number,
    options?: socketio.ServerOptions,
  ): socketio.Server {
    const server = super.createIOServer(port, options);

    server.adapter(createAdapter(this.pubClient, this.subClient));

    server.use(
      async (
        socket: IAuthenticatedSocket,
        next: NextFunction,
      ): Promise<void> => {
        const token =
          socket.handshake.auth['access-token'] ||
          (socket.handshake.headers['access-token'] as string);

        if (!token) {
          socket.disconnect();
          throw new WsException('Unauthorized');
        }

        try {
          const decodedToken = jwt.decode(token) as {
            id: number;
          };

          const tokenKey = await this.tokenService.getTokenKey(decodedToken.id);

          if (!tokenKey) {
            this.logger.error('Token key not found');
            socket.disconnect();
          }

          const payload = this.jwtService.verify(token, {
            secret: tokenKey.publicKey,
            ignoreExpiration: false,
          });

          if (!payload) {
            this.logger.error('Invalid token');
            socket.disconnect();
          }

          socket.user = await this.userService.getUserById(tokenKey.userId);
        } catch (err) {
          this.logger.error(err);
          socket.disconnect();
          throw new WsException('Unauthorized');
        }
        next();
      },
    );

    return server;
  }
}
