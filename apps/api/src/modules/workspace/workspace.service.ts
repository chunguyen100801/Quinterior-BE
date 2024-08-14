import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ApiDataService } from '@datn/prisma';
import { ContextProvider, PageDto, PageMetaDto } from '@datn/shared';
import { WorkspaceQueryOptionsDto } from './dto/workspace-query-options.dto';
import { GenerateHistoryQueryOptionsDto } from './dto/generate-history-query-options.dto';
import { Prisma, TaskStatus } from '@prisma/db-api';
import { omit } from 'lodash';
import { AddInteriorDto } from './dto/add-interior.dto';
import { WeaviateService } from '@datn/weaviate';

@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger(WorkspaceService.name);

  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<ApiDataService>
    >,
    private readonly weaviateService: WeaviateService,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto) {
    const authUser = ContextProvider.getAuthUser();
    return this.txHost.tx.workspace.create({
      data: {
        ...createWorkspaceDto,
        creatorId: authUser.id,
      },
    });
  }

  async findAll(queryOptionsDto: WorkspaceQueryOptionsDto) {
    const authUser = ContextProvider.getAuthUser();
    const { skip, take, order, search } = queryOptionsDto;
    let whereClause: Prisma.WorkspaceWhereInput = {};

    if (search !== ' ' && search?.length > 0) {
      const searchQuery = search.trim();
      whereClause = {
        OR: [
          {
            name: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
        ],
      };
    }

    whereClause = {
      ...whereClause,
      creatorId: authUser.id,
    };

    const [itemCount, workspaces] = await Promise.all([
      this.txHost.tx.workspace.count({
        where: whereClause,
      }),
      this.txHost.tx.workspace.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: {
          createdAt: order,
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          generateHistories: true,
        },
      }),
    ]);

    const data = workspaces.map((workspace) => {
      let url = null;
      const completedHistories = workspace?.generateHistories.filter(
        (history) => history.status === TaskStatus.COMPLETE,
      );

      if (completedHistories?.length > 0) {
        const lastCompletedHistory =
          completedHistories[completedHistories.length - 1];
        url = lastCompletedHistory.url;
      }

      return {
        ...omit(workspace, ['generateHistories']),
        image: url,
      };
    });

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: queryOptionsDto,
    });

    return new PageDto(data, pageMetaDto);
  }

  async findOne(id: number) {
    const authUser = ContextProvider.getAuthUser();
    this.logger.log('Get workspace id: ' + id);
    const workspace = await this.txHost.tx.workspace.findUnique({
      where: {
        id,
        creatorId: authUser.id,
      },
      include: {
        generateHistories: true,
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    let url = null;
    const completedHistories = workspace?.generateHistories.filter(
      (history) => history.status === TaskStatus.COMPLETE,
    );

    if (completedHistories?.length > 0) {
      const lastCompletedHistory =
        completedHistories[completedHistories.length - 1];
      url = lastCompletedHistory.url;
    }

    return {
      ...omit(workspace, ['generateHistories']),
      image: url,
    };
  }

  async update(id: number, updateWorkspaceDto: UpdateWorkspaceDto) {
    const authUser = ContextProvider.getAuthUser();
    return this.txHost.tx.workspace.update({
      where: {
        id,
        creatorId: authUser.id,
      },
      data: updateWorkspaceDto,
    });
  }

  async remove(id: number) {
    const authUser = ContextProvider.getAuthUser();
    return this.txHost.tx.workspace.delete({
      where: {
        id,
        creatorId: authUser.id,
      },
    });
  }

  async getGenerateHistory(
    id: number,
    queryOptionsDto: GenerateHistoryQueryOptionsDto,
  ) {
    const authUser = ContextProvider.getAuthUser();
    const { skip, take, order } = queryOptionsDto;

    const workspace = await this.txHost.tx.workspace.findUnique({
      where: {
        id: id,
        creatorId: authUser.id,
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return this.weaviateService.roomSearchByWorkspaceId(id, take, skip, order);
  }

  async addInterior(addInteriorDto: AddInteriorDto) {
    const authUser = ContextProvider.getAuthUser();
    const { workspaceIds, modelData } = addInteriorDto;

    const workspaces = await Promise.all(
      workspaceIds.map(async (workspaceId) => {
        const workspace = await this.txHost.tx.workspace.findUnique({
          where: { id: workspaceId, creatorId: authUser.id },
        });

        if (!workspace) {
          throw new NotFoundException('Workspace not found');
        }

        if (!workspace.data || typeof workspace.data !== 'object') {
          workspace.data = {
            corners: [],
            walls: [],
            rooms: [],
            freeItems: [],
          };
        }

        if (!Array.isArray(workspace.data?.freeItems)) {
          workspace.data.freeItems = [];
        }

        workspace.data.freeItems.push(modelData);

        return this.txHost.tx.workspace.update({
          where: { id: workspaceId },
          data: { data: workspace.data },
        });
      }),
    );

    return workspaces;
  }

  async deleteGenerateImage(id: string): Promise<void> {
    const authUser = ContextProvider.getAuthUser();
    this.logger.log('Delete task record');
    const task = await this.txHost.tx.task.delete({
      where: {
        id,
      },
    });

    this.logger.log('Delete image in weaviate');

    await this.weaviateService.deleteRoom(task.url);
  }
}
