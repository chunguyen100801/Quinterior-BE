import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { Auth, ResponseSuccessDto } from '@datn/shared';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ROUTES } from '../../constants';

@ApiTags('Addresses')
@Controller(ROUTES.ADDRESSES)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Auth()
  @Post()
  @ApiBody({ type: CreateAddressDto })
  async create(@Body() createAddressDto: CreateAddressDto) {
    const data = await this.addressService.create(createAddressDto);

    return new ResponseSuccessDto(
      HttpStatus.CREATED,
      'Create address successfully',
      data,
    );
  }

  @Auth()
  @Get()
  async findAll() {
    const data = await this.addressService.findAll();

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get address successfully',
      data,
    );
  }

  @Auth()
  @Get('id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.addressService.findOne(id);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get address by id successfully',
      data,
    );
  }

  @Auth()
  @Patch(':id')
  @ApiBody({ type: UpdateAddressDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const data = await this.addressService.update(id, updateAddressDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Address updated successfully',
      data,
    );
  }

  @Auth()
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.addressService.remove(id);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Address deleted successfully',
      data,
    );
  }
}
