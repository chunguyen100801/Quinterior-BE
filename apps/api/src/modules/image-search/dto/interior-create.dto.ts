import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class InteriorCreateDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @Type(() => String)
  urls: string[];

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ type: Number })
  @IsInt()
  @IsNotEmpty()
  productID?: number;
}
