export interface IRedisSubscribeMessage {
  readonly message: string;
  readonly channel: string;
}
