import { Inject, Injectable } from '@nestjs/common';
import { RedisClient } from './redis.provider';
import { RedisKey } from 'ioredis';
import {
  REDIS_PUBLISHER_CLIENT,
  REDIS_SUBSCRIBER_CLIENT,
} from './redis.constant';
import { Observable, Observer } from 'rxjs';
import { IRedisSubscribeMessage } from './redis.interface';
import { filter, map } from 'rxjs/operators';
import { RedisServiceAbstract } from './redis.abstract';

@Injectable()
export class RedisService implements RedisServiceAbstract {
  public constructor(
    @Inject(REDIS_SUBSCRIBER_CLIENT) private readonly subClient: RedisClient,
    @Inject(REDIS_PUBLISHER_CLIENT) private readonly pubClient: RedisClient,
  ) {}

  public fromEvent<T>(eventName: string): Observable<T> {
    this.subClient.subscribe(eventName);

    return new Observable((observer: Observer<IRedisSubscribeMessage>) =>
      this.subClient.on('message', (channel, message) =>
        observer.next({ channel, message }),
      ),
    ).pipe(
      filter(({ channel }): boolean => channel === eventName),
      map(({ message }) => JSON.parse(message)),
    );
  }

  public async publish(channel: string, value: unknown): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      return this.pubClient.publish(
        channel,
        JSON.stringify(value),
        (error, reply) => {
          if (error) {
            return reject(error);
          }

          return resolve(reply);
        },
      );
    });
  }

  public async set(
    key: RedisKey,
    value: unknown,
    expirationSeconds?: number,
  ): Promise<void> {
    if (!expirationSeconds) {
      await this.pubClient.set(
        key,
        JSON.stringify(value),
        'EX',
        expirationSeconds,
      );
    } else {
      await this.pubClient.set(key, JSON.stringify(value));
    }
  }

  public setnx(key: RedisKey, value: unknown): Promise<number> {
    return this.pubClient.setnx(key, JSON.stringify(value));
  }

  public async get<T>(key: RedisKey): Promise<T> {
    const res = await this.pubClient.get(key);

    return (await JSON.parse(res)) as T;
  }

  public del(key: RedisKey): Promise<number> {
    return this.pubClient.del(key);
  }

  public async exists(key: RedisKey): Promise<boolean> {
    return (await this.pubClient.exists(key)) === 1;
  }

  public expire(key: RedisKey, seconds: number): Promise<number> {
    return this.pubClient.expire(key, seconds);
  }

  public keys(pattern: string): Promise<string[]> {
    return this.pubClient.keys(pattern);
  }

  public hset(key: RedisKey, field: string, value: string): Promise<number> {
    return this.pubClient.hset(key, field, value);
  }

  public hdel(key: RedisKey, ...fields: string[]): Promise<number> {
    return this.pubClient.hdel(key, ...fields);
  }

  public hget(key: RedisKey, field: string): Promise<string> {
    return this.pubClient.hget(key, field);
  }

  public hgetall(key: RedisKey): Promise<Record<string, string>> {
    return this.pubClient.hgetall(key);
  }

  public async mget(keys: RedisKey[]) {
    const res = await this.pubClient.mget(keys);

    return res.map((data: string) => JSON.parse(data || null));
  }

  public async mset(data: RedisKey[]): Promise<void> {
    await this.pubClient.mset(data);
  }

  public incr(key: RedisKey): Promise<number> {
    return this.pubClient.incr(key);
  }
}
