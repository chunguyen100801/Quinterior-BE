import { GatewaySessionManager } from './gateway.session';
import { Module } from '@nestjs/common';
import { PROVIDERS } from '@datn/shared';
import { WsGateway } from './gateway';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [
    WsGateway,
    {
      provide: PROVIDERS.GATEWAY_SESSION_MANAGER,
      useClass: GatewaySessionManager,
    },
  ],
  exports: [],
})
export class GatewayModule {}
