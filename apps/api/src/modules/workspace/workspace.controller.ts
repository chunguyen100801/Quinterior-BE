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
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { WorkspaceService } from './workspace.service';
import { Auth, ResponseSuccessDto } from '@datn/shared';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { ROUTES } from '../../constants';
import { WorkspaceQueryOptionsDto } from './dto/workspace-query-options.dto';
import { GenerateHistoryQueryOptionsDto } from './dto/generate-history-query-options.dto';
import { AddInteriorDto } from './dto/add-interior.dto';

@ApiTags('Workspaces')
@Controller(ROUTES.WORKSPACES)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Auth()
  @Post()
  @ApiBody({ type: CreateWorkspaceDto })
  async create(@Body() createWorkspaceDto: CreateWorkspaceDto) {
    const data = await this.workspaceService.create(createWorkspaceDto);

    return new ResponseSuccessDto(
      HttpStatus.CREATED,
      'Create workspace successfully',
      data,
    );
  }

  @Auth()
  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true }))
    queryOptionsDto: WorkspaceQueryOptionsDto,
  ) {
    const data = await this.workspaceService.findAll(queryOptionsDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get workspace successfully',
      data,
    );
  }

  @Auth()
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.workspaceService.findOne(id);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get workspace by id successfully',
      data,
    );
  }

  @Auth()
  @Patch(':id')
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateWorkspaceDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    const data = await this.workspaceService.update(id, updateWorkspaceDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Workspace updated successfully',
      data,
    );
  }

  @Auth()
  @Delete(':id')
  @ApiParam({ name: 'id', type: Number, example: 1 })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.workspaceService.remove(id);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Workspace deleted successfully',
      data,
    );
  }

  @Auth()
  @Delete(':id/generate-history/:id')
  @ApiParam({ name: 'id', type: String })
  async deleteGenerateImage(@Param('id') id: string) {
    const data = await this.workspaceService.deleteGenerateImage(id);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Workspace generate image deleted successfully',
      data,
    );
  }

  @Auth()
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @Get(':id/generate-history')
  async getGenerateHistory(
    @Param('id', ParseIntPipe) id: number,
    @Query(new ValidationPipe({ transform: true }))
    queryOptionsDto: GenerateHistoryQueryOptionsDto,
  ) {
    const data = await this.workspaceService.getGenerateHistory(
      id,
      queryOptionsDto,
    );

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get image generate history successfully',
      data,
    );
  }

  @Auth()
  @Post('/interior')
  async addInterior(@Body() addInteriorDto: AddInteriorDto) {
    const data = await this.workspaceService.addInterior(addInteriorDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Add interior to workspace successfully',
      data,
    );
  }
}
