import {
  ContextProvider,
  PageDto,
  PageMetaDto,
  TOKEN_MESSAGES,
  TokenInvalidException,
  USERS_MESSAGES,
} from '@datn/shared';
import { Prisma, User, UserRole } from '@prisma/db-api';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { generateHash, validateHash } from '../../utils';

import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfigService } from '@nestjs/config';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiDataService } from '@datn/prisma';
import { UsersQueryOptionsDto } from './dto/user-query-options.dto';
import { StorageServiceAbstract } from '@datn/storage';
import { getKeyFromUrl } from '../../utils/get-key-from-url';
import { CreateUserDto } from './dto/create-user.dto';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CartService } from '../cart/cart.service';
import { TokenService } from '../token/token.service';
import { ProductService } from '../product/product.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly storageService: StorageServiceAbstract,
    private readonly mailService: MailService,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<ApiDataService>
    >,
    private readonly cartService: CartService,
    private readonly tokenService: TokenService,
    private readonly productService: ProductService,
  ) {}

  @Transactional<TransactionalAdapterPrisma>()
  async findAll(queryOptionsDto: UsersQueryOptionsDto) {
    const { skip, take, search, order, isDeleted } = queryOptionsDto;

    let whereClause: Prisma.UserWhereInput = {};

    if (search !== ' ' && search?.length > 0) {
      const searchQuery = search.trim();
      whereClause = {
        OR: [
          {
            email: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            lastName: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            firstName: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
        ],
      };
    }

    whereClause = {
      ...whereClause,
      isDeleted: isDeleted,
    };

    const [users, itemCount] = await Promise.all([
      await this.txHost.tx.user.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: {
          createdAt: order,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          avatar: true,
          gender: true,
          role: true,
          isActive: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      }),
      await this.txHost.tx.user.count({ where: whereClause }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: queryOptionsDto,
    });

    return new PageDto(users, pageMetaDto);
  }

  async getUserById(id: number) {
    const user = await this.txHost.tx.user.findUnique({
      where: { id, isDeleted: false },
    });

    if (!user) throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);

    return user;
  }

  async getAllUserById(id: number) {
    const user = await this.txHost.tx.user.findUnique({
      where: { id },
    });

    if (!user) throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);

    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.txHost.tx.user.findUnique({
      where: {
        email,
        isDeleted: false,
      },
    });

    if (!user) throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);

    return user;
  }

  async forgotPassword({ email }: ForgotPasswordDto) {
    const user = await this.getUserByEmail(email);

    const token = this.tokenService.signForgotPasswordToken({
      userId: user.id,
    });

    await this.txHost.tx.user.update({
      where: {
        email,
      },
      data: {
        forgotPasswordToken: token,
      },
    });

    const fullName = user.firstName + ' ' + user.lastName;

    this.logger.log(`Send email forgot password to ${email}`);

    await this.sendForgotPasswordMail({ email, token, name: fullName });
  }

  async verifyForgotPassword(token: string) {
    const authUser = ContextProvider.getAuthUser();

    const frontendURL =
      authUser.role !== UserRole.ADMIN
        ? this.config.get('app.frontendURL')
        : this.config.get('app.adminFrontendURL');
    return `${frontendURL}/reset-password?token=${token}`;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;
    let payload: {
      userId: number;
    };

    try {
      payload = this.jwtService.verify(token, {
        secret: this.config.getOrThrow<string>('auth.jwtForgotPasswordSecret'),
        ignoreExpiration: false,
      });
    } catch (error) {
      throw new TokenInvalidException(TOKEN_MESSAGES.TOKEN_IS_INVALID);
    }

    const user = await this.getUserById(payload.userId);

    if (user.forgotPasswordToken != token)
      throw new BadRequestException(
        USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_INVALID,
      );

    await this.txHost.tx.user.update({
      where: {
        email: user.email,
      },
      data: {
        password: generateHash(password),
        forgotPasswordToken: null,
      },
    });
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const { newPassword, oldPassword, confirmPassword } = changePasswordDto;

    const authUser = ContextProvider.getAuthUser();

    const user = await this.getUserById(authUser.id);

    if (newPassword !== confirmPassword) {
      throw new BadRequestException(USERS_MESSAGES.PASSWORD_NOT_MATCH);
    }

    if (!(await validateHash(oldPassword, user.password))) {
      throw new BadRequestException(USERS_MESSAGES.PASSWORD_NOT_MATCH);
    }

    const hashedNewPassword = generateHash(newPassword);

    await this.txHost.tx.user.update({
      where: { id: authUser.id },
      data: {
        password: hashedNewPassword,
      },
    });
  }

  @Transactional<TransactionalAdapterPrisma>()
  async update(updateUserDto: UpdateUserDto, avatar: Express.Multer.File) {
    const authUser = ContextProvider.getAuthUser();
    let avatarURL: string;

    if (avatar) {
      if (authUser.avatar) {
        const oldKey = getKeyFromUrl(authUser.avatar);
        await this.storageService.deleteFile(oldKey);
      }

      avatarURL = await this.storageService.createFile(authUser.id, {
        file: avatar,
      });
    }

    const updatedUser = await this.txHost.tx.user.update({
      where: { id: authUser.id, isDeleted: false },
      data: {
        ...updateUserDto,
        avatar: avatarURL,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        avatar: true,
        gender: true,
        role: true,
        isActive: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    this.logger.log('Update user info successfully');

    return updatedUser;
  }

  @Transactional<TransactionalAdapterPrisma>()
  async lock(id: number) {
    await this.txHost.tx.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await this.productService.deleteProductsByUserId(id);
    //TODO: delete more resource relate to user
  }

  @Transactional<TransactionalAdapterPrisma>()
  async create(avatar: Express.Multer.File, createUserDto: CreateUserDto) {
    const authUser = ContextProvider.getAuthUser();
    const { email, password } = createUserDto;

    const checkExistEmail: boolean = await this.isEmailTaken(email);

    if (checkExistEmail)
      throw new BadRequestException(USERS_MESSAGES.EMAIL_ALREADY_EXISTS);

    const hashedPassword = generateHash(password);

    let avatarUrl: string;

    if (avatar) {
      avatarUrl = await this.storageService.createFile(authUser.id, {
        file: avatar,
      });
    }

    const user = await this.txHost.tx.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        avatar: avatarUrl,
        isActive: true,
      },
    });

    await this.cartService.createCart(user.id);

    return user;
  }

  async isEmailTaken(email: string): Promise<boolean> {
    const existingUser: User = await this.txHost.tx.user.findUnique({
      where: {
        email,
      },
    });

    return Boolean(existingUser);
  }

  async unLock(id: number) {
    const user = await this.getAllUserById(id);

    if (!user.isDeleted) {
      throw new BadRequestException('User is not locked');
    }

    await this.txHost.tx.user.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  private sendForgotPasswordMail({
    email,
    token,
    name,
  }: {
    email: string;
    token: string;
    name: string;
  }) {
    const apiPrefix: string = this.config.getOrThrow<string>('app.apiPrefix');

    const resetLink: string = `${this.config.getOrThrow(
      'app.appURL',
    )}/${apiPrefix}/users/verify/forgot-password?token=${token}`;

    return this.mailService.sendMail({
      to: email,
      from: 'elearningapp@gmail.com',
      subject: 'Email reset forgot password for leaning app',
      template: './forgot-password',
      context: {
        name: name,
        resetLink: resetLink,
      },
    });
  }
}
