import { Observable } from 'rxjs';
import { RedisKey } from 'ioredis';

export abstract class RedisServiceAbstract {
  abstract fromEvent<T>(eventName: string): Observable<T>;

  abstract publish(channel: string, value: unknown): Promise<number>;

  abstract set(
    key: RedisKey,
    value: unknown,
    expirationSeconds?: number,
  ): Promise<void>;

  abstract setnx(key: RedisKey, value: unknown): Promise<number>;

  abstract get<T>(key: RedisKey): Promise<T>;

  abstract del(key: RedisKey): Promise<number>;

  abstract exists(key: RedisKey): Promise<boolean>;

  abstract expire(key: RedisKey, seconds: number): Promise<number>;

  abstract keys(pattern: string): Promise<string[]>;

  abstract hset(key: RedisKey, field: string, value: string): Promise<number>;

  abstract hdel(key: RedisKey, ...fields: string[]): Promise<number>;

  abstract hget(key: RedisKey, field: string): Promise<string>;

  abstract hgetall(key: RedisKey): Promise<Record<string, string>>;

  abstract mget(keys: RedisKey[]);

  abstract mset(data: RedisKey[]): Promise<void>;

  abstract incr(key: RedisKey): Promise<number>;
}
