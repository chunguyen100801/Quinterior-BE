import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkspaceData } from './create-workspace-data.dto';

export class CreateWorkspaceDto {
  @ApiProperty({ type: String, example: 'My Workspace' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ type: Object, example: { foo: 'bar' } })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  data: WorkspaceData;
}
