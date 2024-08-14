import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { DistributedLockModule } from '../distributed-lock/distributed-lock.module';

@Module({
  imports: [DistributedLockModule],
  providers: [TaskService],
  controllers: [TaskController],
})
export class TaskModule {}
