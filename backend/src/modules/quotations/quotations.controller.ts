import { Controller, Get, Post, Put, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuotationsService } from './quotations.service.js';
import { Quotation } from '../../entities/quotation.entity.js';

@ApiTags('Quotations')
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all proposals and quotations (Quotations Screen)' })
  @ApiResponse({ status: 200, description: 'All quotations with itemized breakdown and status' })
  async findAll(): Promise<Quotation[]> {
    return this.quotationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quotation proposal details (Quotation Details Screen)' })
  async findOne(@Param('id') id: string): Promise<Quotation> {
    return this.quotationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new quotation with automatic 18% GST calculation' })
  @ApiResponse({ status: 201, description: 'Quotation created' })
  async create(@Body() data: Partial<Quotation>): Promise<Quotation> {
    return this.quotationsService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update quotation items, dates, or notes' })
  async update(@Param('id') id: string, @Body() data: Partial<Quotation>): Promise<Quotation> {
    return this.quotationsService.update(id, data);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Client approval workflow: mark quotation as Approved' })
  async approve(@Param('id') id: string): Promise<Quotation> {
    return this.quotationsService.approve(id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Client rejection or revision request: mark quotation as Rejected' })
  async reject(@Param('id') id: string): Promise<Quotation> {
    return this.quotationsService.reject(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete quotation' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.quotationsService.remove(id);
    return { success: true };
  }
}
