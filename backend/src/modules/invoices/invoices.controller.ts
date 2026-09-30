import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service.js';
import { Invoice } from '../../entities/invoice.entity.js';
import { Payment } from '../../entities/payment.entity.js';

@ApiTags('Invoices & Payments')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List all GST tax invoices (Invoices Screen)' })
  @ApiResponse({ status: 200, description: 'All invoices with paid amounts and balances' })
  async findAll(): Promise<Invoice[]> {
    return this.invoicesService.findAll();
  }

  @Get('payments')
  @ApiOperation({ summary: 'List all recorded transaction payments and receipts' })
  async findAllPayments(): Promise<Payment[]> {
    return this.invoicesService.findAllPayments();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice details by ID (Invoice Details Screen)' })
  async findOne(@Param('id') id: string): Promise<Invoice> {
    return this.invoicesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Generate and issue a new tax invoice' })
  @ApiResponse({ status: 201, description: 'Invoice issued' })
  async create(@Body() data: Partial<Invoice>): Promise<Invoice> {
    return this.invoicesService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update invoice metadata' })
  async update(@Param('id') id: string, @Body() data: Partial<Invoice>): Promise<Invoice> {
    return this.invoicesService.update(id, data);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Process invoice payment via UPI, Bank Transfer, or Card' })
  @ApiResponse({ status: 200, description: 'Payment recorded and invoice marked as Paid' })
  async payInvoice(
    @Param('id') id: string,
    @Body() body: { amount?: number; paymentMethod?: 'UPI' | 'Bank Transfer' | 'Card'; referenceNumber?: string },
  ): Promise<Invoice> {
    return this.invoicesService.payInvoice(id, body.amount, body.paymentMethod, body.referenceNumber);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete invoice' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.invoicesService.remove(id);
    return { success: true };
  }
}
