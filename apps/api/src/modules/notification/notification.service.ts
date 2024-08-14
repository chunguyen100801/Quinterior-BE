import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import {
  ContextProvider,
  INotification,
  NOTIFICATION_MESSAGES,
  PageDto,
  PageMetaDto,
} from '@datn/shared';

import { ApiDataService } from '@datn/prisma';
import { NotificationQueryOptionsDto } from './dto/notification-query-options.dto';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: ApiDataService) {}

  createNotification(createNotificationDto: INotification) {
    this.logger.log('Create notification');
    return this.prisma.notification.create({
      data: {
        ...createNotificationDto,
        creatorId: createNotificationDto.creatorId,
      },
      include: {
        recipient: {
          select: {
            id: true,
            avatar: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getUnreadNotificationsCount() {
    const authUser = ContextProvider.getAuthUser();

    const unreadNotifications = await this.prisma.notification.count({
      where: {
        recipientId: authUser.id,
        isRead: false,
      },
    });

    return unreadNotifications;
  }

  async findAllByUserId(
    queryOptionsDto: NotificationQueryOptionsDto,
  ): Promise<PageDto<Notification>> {
    const authUser = ContextProvider.getAuthUser();
    const { skip, take, order } = queryOptionsDto;

    const [itemCount, notifications] = await Promise.all([
      this.prisma.notification.count({
        where: {
          recipientId: authUser.id,
        },
      }),
      this.prisma.notification.findMany({
        where: {
          recipientId: authUser.id,
        },
        skip,
        take,
        include: {
          recipient: {
            select: {
              id: true,
              avatar: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: order,
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: queryOptionsDto,
    });

    return new PageDto(notifications, pageMetaDto);
  }

  async findOne(notificationId: number) {
    const authUser = ContextProvider.getAuthUser();

    const notification = await this.prisma.notification.findUnique({
      where: {
        id: notificationId,
        recipientId: authUser.id,
      },
      include: {
        recipient: {
          select: {
            id: true,
            avatar: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!notification) {
      return {
        message: NOTIFICATION_MESSAGES.NOTIFICATION_NOT_FOUND,
      };
    }

    return notification;
  }

  async markNotificationsAsRead(notificationId: number) {
    const authUser = ContextProvider.getAuthUser();

    const notification = await this.prisma.notification.findUnique({
      where: {
        id: notificationId,
        recipientId: authUser.id,
      },
    });

    if (!notification) {
      throw new BadRequestException(
        NOTIFICATION_MESSAGES.NOTIFICATION_NOT_FOUND,
      );
    }

    await this.prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });
  }
}
