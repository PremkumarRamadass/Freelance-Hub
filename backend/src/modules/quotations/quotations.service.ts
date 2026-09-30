import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quotation } from '../../entities/quotation.entity.js';

@Injectable()
export class QuotationsService {
  constructor(
    @InjectRepository(Quotation)
    private readonly quoteRepo: Repository<Quotation>,
  ) {}

  async findAll(): Promise<Quotation[]> {
    return this.quoteRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Quotation> {
    const quote = await this.quoteRepo.findOne({ where: { id } });
    if (!quote) throw new NotFoundException(`Quotation with id ${id} not found`);
    return quote;
  }

  async create(data: Partial<Quotation>): Promise<Quotation> {
    const count = await this.quoteRepo.count();
    const nextNum = (count + 1).toString().padStart(3, '0');
    const quoteNumber = data.quoteNumber || `QT-2026-${nextNum}`;

    const subtotal = Number(data.subtotal ?? 0);
    const gstRate = Number(data.gstRate ?? 18);
    const gstAmount = Number(((subtotal * gstRate) / 100).toFixed(2));
    const totalAmount = Number((subtotal + gstAmount).toFixed(2));

    const quote = this.quoteRepo.create({
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      clientEmail: 'client@freelancehub.dev',
      clientName: 'Client',
      ...data,
      quoteNumber,
      subtotal,
      gstRate,
      gstAmount,
      totalAmount,
      status: data.status ?? 'Draft',
      items: data.items ?? [],
    });
    return this.quoteRepo.save(quote);
  }

  async update(id: string, data: Partial<Quotation>): Promise<Quotation> {
    const quote = await this.findOne(id);
    if (data.subtotal !== undefined || data.gstRate !== undefined) {
      const subtotal = Number(data.subtotal ?? quote.subtotal);
      const gstRate = Number(data.gstRate ?? quote.gstRate);
      data.gstAmount = Number(((subtotal * gstRate) / 100).toFixed(2));
      data.totalAmount = Number((subtotal + data.gstAmount).toFixed(2));
    }
    Object.assign(quote, data);
    return this.quoteRepo.save(quote);
  }

  async approve(id: string): Promise<Quotation> {
    const quote = await this.findOne(id);
    quote.status = 'Approved';
    return this.quoteRepo.save(quote);
  }

  async reject(id: string): Promise<Quotation> {
    const quote = await this.findOne(id);
    quote.status = 'Rejected';
    return this.quoteRepo.save(quote);
  }

  async remove(id: string): Promise<void> {
    const quote = await this.findOne(id);
    await this.quoteRepo.remove(quote);
  }
}
