import { User } from '@prisma/db-api';

export class SimpleUserEntity {
  id: number;
  avatar: string;
  firstName: string;
  lastName: string;

  constructor(partial: Partial<User>) {
    this.id = partial.id;
    this.avatar = partial.avatar;
    this.firstName = partial.firstName;
    this.lastName = partial.lastName;
  }
}
