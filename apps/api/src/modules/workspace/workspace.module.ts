import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { HttpModule } from '@nestjs/axios';
import { WeaviateService } from '@datn/weaviate';

@Module({
  imports: [HttpModule],
  providers: [WorkspaceService, WeaviateService],
  controllers: [WorkspaceController],
})
export class WorkspaceModule {}
