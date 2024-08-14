import { IAuthenticatedSocket } from '@datn/shared';
import { Injectable } from '@nestjs/common';
import { IGatewaySessionManager } from './gateway.interface';

@Injectable()
export class GatewaySessionManager implements IGatewaySessionManager {
  private readonly sessions: Map<number, IAuthenticatedSocket> = new Map();

  getUserSocket(id: number) {
    return this.sessions.get(id);
  }

  setUserSocket(userId: number, socket: IAuthenticatedSocket) {
    this.sessions.set(userId, socket);
  }
  removeUserSocket(userId: number) {
    this.sessions.delete(userId);
  }
  getSockets(): Map<number, IAuthenticatedSocket> {
    return this.sessions;
  }
}
