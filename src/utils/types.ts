import { ObjectId } from 'typeorm';

export type JWTPayloadType = {
  id: ObjectId;
  userRole: string;
};
export type AccessTokenType = {
  accessToken: string;
};
