import { ModelType } from '@prisma/db-api';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaJson {
    type WorkspaceData = {
      corners: Corner[];
      walls: Wall[];
      rooms: Room[];
      freeItems: ModelData[];
    };
  }
}

type Coor = {
  x: number;
  y: number;
  z: number;
};

export type ItemSave = ModelData & {
  posMatrix: {
    rotation: Coor;
    position: Coor;
  };
};

type Corner = {
  id: string;
  x: number;
  y: number;
};

type Wall = {
  cornerIds: string[];
  thickNess: number;
  wallHeight: number;
  wallItems: ItemSave[];
};

type Room = {
  name: string;
  cornerIds: string[];
  roomItems: ItemSave[];
};

type ModelData = {
  id: number;
  productId: number;
  x: number;
  y: number;
  z: number;
  url: string;
  type: ModelType;
};

export {};
