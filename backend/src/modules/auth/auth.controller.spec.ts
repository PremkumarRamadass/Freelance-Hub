import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      register: vi.fn(),
      login: vi.fn(),
      findById: vi.fn(),
      updateProfile: vi.fn(),
      changePassword: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should delegate register to AuthService', async () => {
    const dto = { name: 'Prem', email: 'prem@dev.com', password: 'pass', role: 'FREELANCER' as const };
    mockAuthService.register.mockResolvedValue({ token: 't1', user: { id: '1', ...dto } });

    const res = await controller.register(dto);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    expect(res.token).toBe('t1');
  });

  it('should delegate login to AuthService', async () => {
    const dto = { email: 'prem@dev.com', password: 'pass' };
    mockAuthService.login.mockResolvedValue({ token: 't1', user: { id: '1', email: 'prem@dev.com' } });

    const res = await controller.login(dto);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    expect(res.token).toBe('t1');
  });

  it('should delegate getUser to AuthService.findById', async () => {
    mockAuthService.findById.mockResolvedValue({ id: '1', name: 'Prem' });

    const res = await controller.getUser('1');
    expect(mockAuthService.findById).toHaveBeenCalledWith('1');
    expect(res.name).toBe('Prem');
  });
});
