import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../../entities/invoice.entity.js';
import { Payment } from '../../entities/payment.entity.js';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  async findAll(): Promise<Invoice[]> {
    return this.invoiceRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({ where: { id } });
    if (!invoice) throw new NotFoundException(`Invoice with id ${id} not found`);
    return invoice;
  }

  async create(data: Partial<Invoice>): Promise<Invoice> {
    const count = await this.invoiceRepo.count();
    const nextNum = (count + 1).toString().padStart(3, '0');
    const invoiceNumber = data.invoiceNumber || `INV-2026-${nextNum}`;

    const subtotal = Number(data.subtotal ?? 0);
    const taxAmount = Number(data.taxAmount ?? Number(((subtotal * 18) / 100).toFixed(2)));
    const totalAmount = Number((subtotal + taxAmount).toFixed(2));
    const paidAmount = Number(data.paidAmount ?? 0);
    const balanceAmount = Number((totalAmount - paidAmount).toFixed(2));

    const invoice = this.invoiceRepo.create({
      issueDate: new Date().toISOString().split('T')[0],
      clientEmail: 'client@freelancehub.dev',
      ...data,
      invoiceNumber,
      subtotal,
      taxAmount,
      totalAmount,
      paidAmount,
      balanceAmount,
      status: data.status ?? (balanceAmount <= 0 ? 'Paid' : 'Sent'),
      items: data.items ?? [],
    });
    return this.invoiceRepo.save(invoice);
  }

  async update(id: string, data: Partial<Invoice>): Promise<Invoice> {
    const invoice = await this.findOne(id);
    Object.assign(invoice, data);
    return this.invoiceRepo.save(invoice);
  }

  async payInvoice(
    id: string,
    amount?: number,
    paymentMethod: 'UPI' | 'Bank Transfer' | 'Card' = 'UPI',
    refNumber?: string,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id);
    const payAmount = Number(amount ?? invoice.balanceAmount);

    invoice.paidAmount = Number((Number(invoice.paidAmount) + payAmount).toFixed(2));
    invoice.balanceAmount = Number((Number(invoice.totalAmount) - invoice.paidAmount).toFixed(2));
    if (invoice.balanceAmount <= 0) {
      invoice.status = 'Paid';
      invoice.balanceAmount = 0;
    }
    invoice.paymentMethod = paymentMethod;

    const savedInvoice = await this.invoiceRepo.save(invoice);

    const payment = this.paymentRepo.create({
      invoiceId: invoice.invoiceNumber,
      amount: payAmount,
      paymentMethod,
      referenceNumber: refNumber || `UPI/2026/${Math.floor(10000000 + Math.random() * 90000000)}`,
      transactionDate: new Date().toISOString().split('T')[0],
      status: 'Completed',
    });
    await this.paymentRepo.save(payment);

    return savedInvoice;
  }

  async findAllPayments(): Promise<Payment[]> {
    return this.paymentRepo.find({ order: { createdAt: 'DESC' } });
  }

  async remove(id: string): Promise<void> {
    const invoice = await this.findOne(id);
    await this.invoiceRepo.remove(invoice);
  }
}
