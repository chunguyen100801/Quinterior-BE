import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
  ValidationPipe,
} from '@nestjs/common';

import { NotificationService } from './notification.service';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiResponseWithMessage,
  Auth,
  NOTIFICATION_MESSAGES,
  ResponseSuccessDto,
} from '@datn/shared';
import { Notification } from './entities/notification.entity';
import { ROUTES } from '../../constants';
import { NotificationQueryOptionsDto } from './dto/notification-query-options.dto';

@ApiTags('Notifications')
@Controller(ROUTES.NOTIFICATIONS)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Auth()
  @Get()
  async findAllByUserId(
    @Query(new ValidationPipe({ transform: true }))
    queryOptionsDto: NotificationQueryOptionsDto,
  ) {
    const data =
      await this.notificationService.findAllByUserId(queryOptionsDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      NOTIFICATION_MESSAGES.GET_NOTIFICATIONS_SUCCESSFULLY,
      data,
    );
  }

  @Auth()
  @Get('unread-count')
  async getUnreadNotificationsCount() {
    const data = await this.notificationService.getUnreadNotificationsCount();

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get unread notifications count successfully',
      data,
    );
  }

  @Auth()
  @Get(':id')
  @ApiResponseWithMessage(Notification)
  async findOne(@Param('id', ParseIntPipe) notificationId: number) {
    const data = await this.notificationService.findOne(notificationId);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      NOTIFICATION_MESSAGES.GET_NOTIFICATION_BY_ID_SUCCESSFULLY,
      data,
    );
  }

  @Auth()
  @Get(':id/mark-as-read')
  async markAsRead(@Param('id', ParseIntPipe) notificationId: number) {
    await this.notificationService.markNotificationsAsRead(notificationId);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      NOTIFICATION_MESSAGES.MARK_AS_READ_SUCCESSFULLY,
    );
  }
}
