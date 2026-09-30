import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../../entities/document.entity.js';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly docRepo: Repository<Document>,
  ) {}

  async findAll(): Promise<Document[]> {
    return this.docRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Document> {
    const doc = await this.docRepo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException(`Document with id ${id} not found`);
    return doc;
  }

  async create(data: Partial<Document>): Promise<Document> {
    const doc = this.docRepo.create({
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      icon: data.icon || (data.type === 'PDF' ? 'pi-file-pdf' : 'pi-file-word'),
      size: data.size || '1.5 MB',
      type: data.type || 'PDF',
      project: data.project || 'General Contract',
    });
    return this.docRepo.save(doc);
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findOne(id);
    await this.docRepo.remove(doc);
  }
}
