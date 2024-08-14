import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Redirect,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { omit } from 'lodash';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Auth, ResponseSuccessDto, USERS_MESSAGES } from '@datn/shared';
import { Gender, UserRole } from '@prisma/db-api';
import { ROUTES } from '../../constants';
import { UsersQueryOptionsDto } from './dto/user-query-options.dto';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users')
@Controller(ROUTES.USERS)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          nullable: false,
        },
        lastName: {
          type: 'string',
          nullable: false,
        },
        email: {
          type: 'string',
          nullable: false,
        },
        password: {
          type: 'string',
          nullable: false,
        },
        phoneNumber: {
          type: 'string',
          nullable: true,
        },
        gender: {
          type: 'string',
          enum: Object.values(Gender),
          nullable: true,
        },
        role: {
          type: 'string',
          enum: Object.values(UserRole),
          nullable: true,
        },
        avatar: {
          type: 'string',
          format: 'binary',
          nullable: true,
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @Auth([UserRole.ADMIN])
  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    avatar: Express.Multer.File,
  ) {
    const data = await this.userService.create(avatar, createUserDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Create user successfully',
      data,
    );
  }

  @Auth([UserRole.ADMIN])
  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true }))
    queryOptionsDto: UsersQueryOptionsDto,
  ) {
    const data = await this.userService.findAll(queryOptionsDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      USERS_MESSAGES.GET_USERS_LIST_SUCCESSFULLY,
      data,
    );
  }

  @Post('forgot-password')
  @Auth([], { public: true })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.userService.forgotPassword(forgotPasswordDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD,
    );
  }

  @Get('/forgot-password')
  @Auth([], { public: true })
  @Redirect()
  async verifyForgotPassword(@Query('token') token: string) {
    const url: string = await this.userService.verifyForgotPassword(token);
    return {
      url: url,
    };
  }

  @Auth([UserRole.ADMIN])
  @ApiParam({ name: 'id', type: Number })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = omit(await this.userService.getUserById(id), ['password']);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get user by id successfully',
      data,
    );
  }

  @ApiBody({ type: ResetPasswordDto })
  @Post('reset-password')
  @Auth([], { public: true })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.userService.resetPassword(resetPasswordDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      USERS_MESSAGES.RESET_PASSWORD_SUCCESSFUL,
    );
  }

  @ApiBody({ type: ChangePasswordDto })
  @Patch('/me/change-password')
  @Auth([], { public: true })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    await this.userService.changePassword(changePasswordDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      USERS_MESSAGES.CHANGE_PASSWORD_SUCCESSFULLY,
    );
  }

  @Auth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          nullable: true,
        },
        lastName: {
          type: 'string',
          nullable: true,
        },
        phoneNumber: {
          type: 'string',
          nullable: true,
        },
        gender: {
          type: 'string',
          enum: Object.values(UserRole),
          nullable: true,
        },
        avatar: {
          type: 'string',
          format: 'binary',
          nullable: true,
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @Patch('me/update')
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    avatar: Express.Multer.File,
  ) {
    const data = await this.userService.update(updateUserDto, avatar);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      USERS_MESSAGES.UPDATE_PROFILE_SUCCESSFULLY,
      data,
    );
  }

  @Auth([UserRole.ADMIN])
  @Put(':id/lock')
  @ApiParam({ name: 'id', type: Number })
  async lock(@Param('id', ParseIntPipe) id: number) {
    await this.userService.lock(id);

    return new ResponseSuccessDto(HttpStatus.OK, 'Lock user successfully');
  }

  @Auth([UserRole.ADMIN])
  @Put(':id/unlock')
  @ApiParam({ name: 'id', type: Number })
  async unLock(@Param('id', ParseIntPipe) id: number) {
    await this.userService.unLock(id);

    return new ResponseSuccessDto(HttpStatus.OK, 'Unlock user successfully');
  }
}
