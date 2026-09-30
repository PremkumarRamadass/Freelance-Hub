import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller.js';
import { DocumentsService } from './documents.service.js';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      findAll: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
  });

  it('should list all documents', async () => {
    mockService.findAll.mockResolvedValue([{ id: '1', name: 'File.pdf' }]);
    const res = await controller.findAll();
    expect(res.length).toBe(1);
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('should create document via create', async () => {
    mockService.create.mockResolvedValue({ id: '1', name: 'File.pdf' });
    const res = await controller.create({ name: 'File.pdf' });
    expect(res.name).toBe('File.pdf');
  });

  it('should remove document via remove', async () => {
    mockService.remove.mockResolvedValue(undefined);
    const res = await controller.remove('1');
    expect(res.success).toBe(true);
  });
});
