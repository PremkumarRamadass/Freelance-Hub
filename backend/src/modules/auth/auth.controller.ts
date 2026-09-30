import { Controller, Post, Body, Get, Put, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import type { RegisterDto, LoginDto } from './auth.service.js';
import { User } from '../../entities/user.entity.js';

@ApiTags('Auth & Profile')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new Freelancer, Client, or Admin account' })
  @ApiResponse({ status: 201, description: 'User account created successfully' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user with email and password' })
  @ApiResponse({ status: 200, description: 'JWT authentication token and user profile returned' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Get user profile by ID' })
  async getUser(@Param('id') id: string) {
    return this.authService.findById(id);
  }

  @Put('profile/:id')
  @ApiOperation({ summary: 'Update user profile (Settings Screen)' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(@Param('id') id: string, @Body() data: Partial<User>) {
    return this.authService.updateProfile(id, data);
  }

  @Put('change-password/:id')
  @ApiOperation({ summary: 'Change user account password (Settings Screen)' })
  @ApiResponse({ status: 200, description: 'Password changed' })
  async changePassword(
    @Param('id') id: string,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(id, body.oldPassword, body.newPassword);
  }
}
