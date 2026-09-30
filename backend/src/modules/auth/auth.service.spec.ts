import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { User } from '../../entities/user.entity.js';
import { Client } from '../../entities/client.entity.js';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepo: any;
  let mockClientRepo: any;

  beforeEach(async () => {
    mockUserRepo = {
      findOne: vi.fn(),
      create: vi.fn((dto) => ({ id: 'usr_1', ...dto })),
      save: vi.fn((entity) => Promise.resolve({ id: 'usr_1', ...entity })),
    };

    mockClientRepo = {
      findOne: vi.fn(),
      create: vi.fn((dto) => ({ id: 'cli_1', ...dto })),
      save: vi.fn((entity) => Promise.resolve({ id: 'cli_1', ...entity })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(Client),
          useValue: mockClientRepo,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should register a new FREELANCER user successfully', async () => {
    mockUserRepo.findOne.mockResolvedValue(null);

    const result = await service.register({
      name: 'Premkumar',
      email: 'prem@example.com',
      password: 'password123',
      role: 'FREELANCER',
    });

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('prem@example.com');
    expect(mockUserRepo.create).toHaveBeenCalled();
    expect(mockUserRepo.save).toHaveBeenCalled();
  });

  it('should throw ConflictException if registering existing email', async () => {
    mockUserRepo.findOne.mockResolvedValue({ id: 'existing', email: 'taken@example.com' });

    await expect(
      service.register({
        name: 'Taken',
        email: 'taken@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should authenticate user and return token on valid login', async () => {
    const hashed = await bcrypt.hash('secretPass', 10);
    mockUserRepo.findOne.mockResolvedValue({
      id: 'usr_1',
      name: 'Premkumar',
      email: 'prem@example.com',
      password: hashed,
      role: 'FREELANCER',
    });

    const result = await service.login({
      email: 'prem@example.com',
      password: 'secretPass',
    });

    expect(result.token).toBeDefined();
    expect(result.user.name).toBe('Premkumar');
  });

  it('should throw UnauthorizedException if password does not match', async () => {
    const hashed = await bcrypt.hash('secretPass', 10);
    mockUserRepo.findOne.mockResolvedValue({
      id: 'usr_1',
      email: 'prem@example.com',
      password: hashed,
    });

    await expect(
      service.login({
        email: 'prem@example.com',
        password: 'wrongPassword',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
