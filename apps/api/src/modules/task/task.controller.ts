import { UserRole } from '@prisma/db-api';
import { TaskService } from './task.service';
import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth, ResponseSuccessDto } from '@datn/shared';
import { ROUTES } from '../../constants';

@ApiTags('Tasks')
@Controller(ROUTES.TASKS)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Auth([UserRole.ADMIN])
  @Get()
  async disableScheduleTask() {
    await this.taskService.disableScheduleTask();

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Disable schedule task successfully',
    );
  }
}
