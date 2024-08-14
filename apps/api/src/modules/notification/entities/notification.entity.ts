import { ApiProperty } from '@nestjs/swagger';
import { SimpleUserEntity } from '@datn/shared';

export class Notification {
  @ApiProperty({
    type: Number,
    example: 1,
  })
  id: number;

  @ApiProperty({
    type: Number,
    example: 1,
  })
  recipientId: number;

  @ApiProperty({
    type: Number,
    example: 1,
  })
  creatorId: number;

  @ApiProperty({
    type: String,
    example: 'notification title',
  })
  title: string;

  @ApiProperty({
    type: String,
    example: 'notification body',
  })
  content: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  isRead: boolean;

  @ApiProperty({
    type: SimpleUserEntity,
  })
  recipient: SimpleUserEntity;
}
