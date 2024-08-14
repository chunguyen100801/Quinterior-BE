import { ModelType } from '@prisma/db-api';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class Coor {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  z: number;
}

export class Corner {
  @IsString()
  id: string;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;
}

export class Wall {
  @IsArray()
  @IsString({ each: true })
  cornerIds: string[];

  @IsNumber()
  thickNess: number;

  @IsNumber()
  wallHeight: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModelData)
  wallItems: ModelData[];
}

export class Room {
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  cornerIds: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModelData)
  roomItems: ModelData[];
}

export class PosMatrix {
  @ValidateNested()
  @Type(() => Coor)
  rotation: Coor;

  @ValidateNested()
  @Type(() => Coor)
  position: Coor;
}

export class ModelData {
  @IsNumber()
  id: number;

  @IsNumber()
  productId: number;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  z: number;

  @IsString()
  url: string;

  @IsEnum(ModelType)
  type: ModelType;

  @ValidateNested()
  @Type(() => PosMatrix)
  posMatrix: PosMatrix;
}

export class WorkspaceData {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Corner)
  corners: Corner[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Wall)
  walls: Wall[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Room)
  rooms: Room[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModelData)
  freeItems: ModelData[];
}
