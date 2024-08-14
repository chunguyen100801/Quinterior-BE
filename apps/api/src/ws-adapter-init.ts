import { INestApplication } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import {
  REDIS_PUBLISHER_CLIENT,
  REDIS_SUBSCRIBER_CLIENT,
  RedisClient,
} from '@datn/redis';
import { WebsocketAdapter } from './modules/gateway/gateway.adapter';

export const initWebsocketAdapters = (
  app: INestApplication,
): INestApplication => {
  const moduleRef = app.get(ModuleRef);
  const pubClient: RedisClient = app.get(REDIS_PUBLISHER_CLIENT);
  const subClient: RedisClient = app.get(REDIS_SUBSCRIBER_CLIENT);

  app.useWebSocketAdapter(
    new WebsocketAdapter(app, moduleRef, subClient, pubClient),
  );

  return app;
};
