import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClientsService } from './clients.service.js';
import { Client } from '../../entities/client.entity.js';

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'List all clients (Clients Screen)' })
  @ApiResponse({ status: 200, description: 'All registered enterprise clients' })
  async findAll(): Promise<Client[]> {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client details by ID' })
  async findOne(@Param('id') id: string): Promise<Client> {
    return this.clientsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new client profile' })
  @ApiResponse({ status: 201, description: 'Client created' })
  async create(@Body() data: Partial<Client>): Promise<Client> {
    return this.clientsService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update client details' })
  async update(@Param('id') id: string, @Body() data: Partial<Client>): Promise<Client> {
    return this.clientsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete client' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.clientsService.remove(id);
    return { success: true };
  }
}
