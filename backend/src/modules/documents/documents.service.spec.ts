import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { DocumentsService } from './documents.service.js';
import { Document } from '../../entities/document.entity.js';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let mockDocRepo: any;

  const mockDoc = {
    id: 'doc_1',
    name: 'NDA.pdf',
    type: 'PDF',
    size: '1.2 MB',
  };

  beforeEach(async () => {
    mockDocRepo = {
      find: vi.fn().mockResolvedValue([mockDoc]),
      findOne: vi.fn(),
      create: vi.fn((data) => ({ id: 'doc_new', ...data })),
      save: vi.fn((entity) => Promise.resolve(entity)),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocRepo,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should return all documents on findAll', async () => {
    const list = await service.findAll();
    expect(list.length).toBe(1);
    expect(mockDocRepo.find).toHaveBeenCalled();
  });

  it('should find document by id', async () => {
    mockDocRepo.findOne.mockResolvedValue(mockDoc);
    const doc = await service.findOne('doc_1');
    expect(doc.id).toBe('doc_1');
  });

  it('should throw NotFoundException if document not found', async () => {
    mockDocRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });

  it('should create and save a new document', async () => {
    const doc = await service.create({ name: 'Scope.pdf', type: 'PDF' });
    expect(doc.name).toBe('Scope.pdf');
    expect(mockDocRepo.create).toHaveBeenCalled();
    expect(mockDocRepo.save).toHaveBeenCalled();
  });

  it('should remove a document', async () => {
    mockDocRepo.findOne.mockResolvedValue(mockDoc);
    await service.remove('doc_1');
    expect(mockDocRepo.remove).toHaveBeenCalledWith(mockDoc);
  });
});
