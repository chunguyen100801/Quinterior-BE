import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ROUTES } from '../../constants';
import { CreditService } from './credit.service';
import { Auth, ResponseSuccessDto } from '@datn/shared';

@ApiTags('Credits')
@Controller(ROUTES.CREDITS)
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Auth()
  @Get('usage')
  async getUsage() {
    const data = await this.creditService.getUsage();
    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get credits usage today successfully',
      data,
    );
  }
}
