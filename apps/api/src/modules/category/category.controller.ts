import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
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
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Auth, ResponseSuccessDto } from '@datn/shared';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ROUTES } from '../../constants';
import { CategoryQueryOptionsDto } from './dto/category-query-options.dto';

@ApiTags('Categories')
@Controller(ROUTES.CATEGORIES)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Auth()
  @Post()
  @ApiBody({ type: CreateCategoryDto })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const data = await this.categoryService.create(createCategoryDto);

    return new ResponseSuccessDto(
      HttpStatus.CREATED,
      'Create category successfully',
      data,
    );
  }

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true }))
    queryOptionsDto: CategoryQueryOptionsDto,
  ) {
    const data = await this.categoryService.findAll(queryOptionsDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get categories successfully',
      data,
    );
  }

  @Auth()
  @Get(':id')
  @ApiParam({ name: 'id', required: true, type: 'number' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.categoryService.findOne(id);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get category by id successfully',
      data,
    );
  }

  @Auth()
  @Patch(':id')
  @ApiParam({ name: 'id', required: true, type: 'number' })
  @ApiBody({ type: UpdateCategoryDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const data = await this.categoryService.update(id, updateCategoryDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Update category successfully',
      data,
    );
  }

  @Auth()
  @Delete(':id')
  @ApiParam({ name: 'id', required: true, type: 'number' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.categoryService.remove(id);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Delete category successfully',
    );
  }
}
