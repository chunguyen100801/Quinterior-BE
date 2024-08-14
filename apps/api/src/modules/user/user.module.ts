import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../mail/mail.module';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { StorageModule } from '@datn/s3';
import { StorageService, StorageServiceAbstract } from '@datn/storage';
import { CartModule } from '../cart/cart.module';
import { TokenModule } from '../token/token.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    JwtModule.register({}),
    MailModule,
    StorageModule,
    CartModule,
    TokenModule,
    ProductModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: StorageServiceAbstract,
      useClass: StorageService,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
