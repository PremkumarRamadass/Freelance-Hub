import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service.js';
import { Client } from '../../entities/client.entity.js';

describe('ClientsService', () => {
  let service: ClientsService;
  let mockClientRepo: any;

  const mockClient = {
    id: 'cli_1',
    name: 'Rahul Sharma',
    company: 'ABC Pvt Ltd',
    email: 'rahul@abc.com',
    status: 'Active',
  };

  beforeEach(async () => {
    mockClientRepo = {
      find: vi.fn().mockResolvedValue([mockClient]),
      findOne: vi.fn(),
      create: vi.fn((data) => ({ id: 'cli_new', ...data })),
      save: vi.fn((entity) => Promise.resolve(entity)),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(Client),
          useValue: mockClientRepo,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  it('should return all clients on findAll', async () => {
    const clients = await service.findAll();
    expect(clients.length).toBe(1);
    expect(mockClientRepo.find).toHaveBeenCalled();
  });

  it('should return a client by id', async () => {
    mockClientRepo.findOne.mockResolvedValue(mockClient);
    const client = await service.findOne('cli_1');
    expect(client.id).toBe('cli_1');
  });

  it('should throw NotFoundException if client does not exist', async () => {
    mockClientRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });

  it('should create and save a new client', async () => {
    const data = { name: 'Sarah', company: 'Cyberdyne', email: 'sarah@cyberdyne.com' };
    const result = await service.create(data);
    expect(result.name).toBe('Sarah');
    expect(mockClientRepo.create).toHaveBeenCalled();
    expect(mockClientRepo.save).toHaveBeenCalled();
  });

  it('should remove an existing client', async () => {
    mockClientRepo.findOne.mockResolvedValue(mockClient);
    await service.remove('cli_1');
    expect(mockClientRepo.remove).toHaveBeenCalledWith(mockClient);
  });
});
