import type { Request as ExpressRequest } from 'express';
import { Profile as FaceBookProfile } from 'passport-facebook';
import { Profile as GoogleProfile } from 'passport-google-oauth20';
import type { Request as NestRequest } from '@nestjs/common';
import { User } from '@prisma/db-api';

export interface IOAuthRequestUser {
  profile: GoogleProfile | FaceBookProfile;
}

export interface UserWithTokenKeyId extends User {
  tokenId: number;
}

type CombinedRequest = ExpressRequest & typeof NestRequest;
export interface IUserRequest extends CombinedRequest {
  user: UserWithTokenKeyId;
}

export interface IOAuthRequest extends CombinedRequest {
  user: IOAuthRequestUser;
}
