import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DocumentsService } from './documents.service.js';
import { Document } from '../../entities/document.entity.js';

@ApiTags('Documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all project contracts, NDAs, and specs (Documents Screen)' })
  @ApiResponse({ status: 200, description: 'List of documents' })
  async findAll(): Promise<Document[]> {
    return this.documentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document details by ID' })
  async findOne(@Param('id') id: string): Promise<Document> {
    return this.documentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Upload or register new document metadata' })
  @ApiResponse({ status: 201, description: 'Document created' })
  async create(@Body() data: Partial<Document>): Promise<Document> {
    return this.documentsService.create(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document by ID' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.documentsService.remove(id);
    return { success: true };
  }
}
