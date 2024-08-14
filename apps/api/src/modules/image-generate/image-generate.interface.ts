import { TaskStatus } from '@prisma/db-api';

export interface ImageGenerateResponse {
  id: string;
  status: TaskStatus;
  image_url: string | null;
  prompt: string;
  workspaceId: number;
}
