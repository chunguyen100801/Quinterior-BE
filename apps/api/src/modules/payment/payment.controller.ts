import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { VnpQueryParams } from './payment.interface';
import { ROUTES } from '../../constants';

@ApiTags('Payments')
@Controller(ROUTES.PAYMENTS)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('vnpay-callback')
  @Redirect()
  returnUrl(@Query() query: VnpQueryParams) {
    return this.paymentService.processReturnUrl(query);
  }
}
