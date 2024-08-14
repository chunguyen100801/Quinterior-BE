import { AddInteriorModelDto } from './add-interior-model.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsInt, ValidateNested } from 'class-validator';

export class AddInteriorDto {
  @ApiProperty({ type: AddInteriorModelDto })
  @ValidateNested()
  modelData: AddInteriorModelDto;

  @ApiProperty({ type: [Number], example: [1, 2, 3] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  workspaceIds: number[];
}
