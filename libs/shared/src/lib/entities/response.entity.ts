import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseEntity<T> {
  @ApiProperty({ type: String, example: 'Update successfully' })
  message: string;

  @ApiProperty()
  data: T;
}

export class ApiResponseArrayEntity<T> {
  @ApiProperty({ type: String, example: 'Get all data successfully' })
  message: string;

  @ApiProperty()
  data: T[];
}

export class ApiResponseOmitDataEntity {
  @ApiProperty({ type: String, example: 'Update successfully' })
  message: string;
}
