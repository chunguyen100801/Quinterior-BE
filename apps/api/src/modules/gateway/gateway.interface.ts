import { IAuthenticatedSocket } from '@datn/shared';

export interface IGatewaySessionManager {
  getUserSocket(id: number): IAuthenticatedSocket;
  setUserSocket(id: number, socket: IAuthenticatedSocket): void;
  removeUserSocket(id: number): void;
  getSockets(): Map<number, IAuthenticatedSocket>;
}
