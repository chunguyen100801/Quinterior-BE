import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  Auth,
  FacebookAuthGuard,
  GoogleAuthGuard,
  IOAuthRequest,
  IUserRequest,
  LocalAuthGuard,
  RefreshTokenGuard,
  ResponseSuccessDto,
  USERS_MESSAGES,
} from '@datn/shared';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerifyEmailDto } from './dto/resend-verify-email.dto';
import { ROUTES } from '../../constants';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Authentication')
@Controller(ROUTES.AUTH)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({
    default: {
      limit: 5,
      ttl: 60000,
      getTracker: (req) => {
        return req.ip;
      },
    },
  })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Register successful',
        },
      },
    },
  })
  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto);

    return new ResponseSuccessDto(
      HttpStatus.CREATED,
      USERS_MESSAGES.REGISTER_SUCCESSFUL,
    );
  }

  @UseGuards(FacebookAuthGuard)
  @Get('facebook')
  loginWithFacebook() {
    return new ResponseSuccessDto(HttpStatus.OK, 'Redirect to facebook login');
  }

  @UseGuards(FacebookAuthGuard)
  @Get('facebook/redirect')
  loginWithFacebookCallback(@Req() req: IOAuthRequest) {
    return this.authService.loginFacebook(req);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  loginWithGoogle() {
    return new ResponseSuccessDto(HttpStatus.OK, 'Redirect to google login');
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/redirect')
  loginWithGoogleCallback(@Req() req: IOAuthRequest) {
    return this.authService.loginGoogle(req);
  }

  @Throttle({
    default: {
      limit: 5,
      ttl: 60000,
      getTracker: (req) => {
        return req.ip;
      },
    },
  })
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: AuthCredentialsDto })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Login successfully',
        },
        data: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
            },
            refreshToken: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(@Req() req: IUserRequest) {
    const data = await this.authService.login(req);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      USERS_MESSAGES.LOGIN_SUCCESSFUL,
      data,
    );
  }

  @ApiNotFoundResponse({
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found' },
        error: { type: 'string', example: 'Not found' },
      },
    },
  })
  @Auth()
  @HttpCode(HttpStatus.OK)
  @Get('/me')
  async getMe() {
    return this.authService.getMe();
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Register successfully',
        },
        data: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
            },
            refreshToken: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refreshToken(@Req() request: IUserRequest) {
    const data = await this.authService.refreshToken({
      user: request.user,
      tokenKeyId: request.user.tokenId,
    });

    return new ResponseSuccessDto(
      HttpStatus.OK,
      USERS_MESSAGES.REFRESH_TOKEN_SUCCESSFULLY,
      data,
    );
  }

  @Get('verify-email')
  @Redirect()
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verify-email')
  @ApiBody({ type: ResendVerifyEmailDto })
  async resendVerifyEmail(@Body() resendVerifyEmailDto: ResendVerifyEmailDto) {
    await this.authService.resendVerifyEmail(resendVerifyEmailDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESSFULLY,
    );
  }

  @Auth()
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logged out successfully' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Delete('/logout')
  async logout() {
    await this.authService.logout();

    return new ResponseSuccessDto(
      HttpStatus.OK,
      USERS_MESSAGES.LOGOUT_SUCCESSFUL,
    );
  }
}
