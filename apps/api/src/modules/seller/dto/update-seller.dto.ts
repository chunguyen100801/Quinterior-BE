import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateSellerDto {
  @ApiProperty({ type: String, example: 'demo' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ type: String, example: 'This is demo' })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description: string;

  @ApiProperty({ type: String, example: 'Đà Nẵng' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  address: string;
}
