import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller.js';
import { ClientsService } from './clients.service.js';

describe('ClientsController', () => {
  let controller: ClientsController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      findAll: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: ClientsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
  });

  it('should list all clients via findAll', async () => {
    mockService.findAll.mockResolvedValue([{ id: '1', name: 'Acme' }]);
    const res = await controller.findAll();
    expect(res.length).toBe(1);
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('should find one client by id', async () => {
    mockService.findOne.mockResolvedValue({ id: '1', name: 'Acme' });
    const res = await controller.findOne('1');
    expect(res.id).toBe('1');
    expect(mockService.findOne).toHaveBeenCalledWith('1');
  });

  it('should create client via create', async () => {
    mockService.create.mockResolvedValue({ id: '1', name: 'New' });
    const res = await controller.create({ name: 'New' });
    expect(res.name).toBe('New');
  });

  it('should remove client via remove', async () => {
    mockService.remove.mockResolvedValue(undefined);
    const res = await controller.remove('1');
    expect(res.success).toBe(true);
    expect(mockService.remove).toHaveBeenCalledWith('1');
  });
});
