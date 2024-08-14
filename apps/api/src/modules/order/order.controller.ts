import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Ip,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Auth, ResponseSuccessDto } from '@datn/shared';
import { UserRole } from '@prisma/db-api';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryOptionsDto } from './dto/order-query-options.dto';
import { ROUTES } from '../../constants';

@ApiTags('Orders')
@Controller(ROUTES.ORDERS)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Auth()
  @Post()
  @ApiBody({ type: CreateOrderDto })
  async create(@Ip() ipAddr: string, @Body() createOrderDto: CreateOrderDto) {
    const data = await this.orderService.create(ipAddr, createOrderDto);

    return new ResponseSuccessDto(
      HttpStatus.CREATED,
      'Create order successfully',
      data,
    );
  }

  @Auth()
  @Get('/sales-history')
  async getSaleHistory(
    @Query(new ValidationPipe({ transform: true }))
    queryOptionsDto: OrderQueryOptionsDto,
  ) {
    const data = await this.orderService.getSalesHistory(queryOptionsDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get sales history successfully',
      data,
    );
  }

  @Auth()
  @ApiOperation({ description: 'Can use for admin and seller' })
  @Get('revenue-date')
  async getRevenueByDate(@Query('date') date: string) {
    const data = await this.orderService.getRevenueByDate(date);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get revenue by date successfully',
      data,
    );
  }

  @Auth()
  @ApiOperation({ description: 'Can use for admin and seller' })
  @Get('revenue-year')
  async getRevenueByYear(@Query('year') year: number) {
    const data = await this.orderService.getRevenueByYear(year);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get revenue by year successfully',
      data,
    );
  }

  @Auth()
  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true }))
    queryOptionsDto: OrderQueryOptionsDto,
  ) {
    const data = await this.orderService.findAll(queryOptionsDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get orders successfully',
      data,
    );
  }

  @Auth()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.orderService.findOne(id);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get order by id successfully',
      data,
    );
  }

  @Auth()
  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const data = await this.orderService.updateOrderStatus(
      id,
      updateOrderStatusDto,
    );

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Update status order successfully',
      data,
    );
  }

  @Auth([UserRole.ADMIN])
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.orderService.delete(id);

    return new ResponseSuccessDto(HttpStatus.OK, 'Delete order successfully');
  }
}
