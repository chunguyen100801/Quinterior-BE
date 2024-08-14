import { User } from '@prisma/db-api';
import { Socket } from 'socket.io';
export interface IAuthenticatedSocket extends Socket {
  user?: User;
}
