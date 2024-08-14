import { CreateWorkspaceDto } from './create-workspace.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateWorkspaceDto extends PartialType(CreateWorkspaceDto) {}
