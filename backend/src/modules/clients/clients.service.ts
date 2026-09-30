import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../../entities/client.entity.js';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
  ) {}

  async findAll(): Promise<Client[]> {
    return this.clientRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepo.findOne({ where: { id } });
    if (!client) throw new NotFoundException(`Client with id ${id} not found`);
    return client;
  }

  async create(data: Partial<Client>): Promise<Client> {
    const client = this.clientRepo.create({
      ...data,
      totalBilled: data.totalBilled ?? 0,
      totalPaid: data.totalPaid ?? 0,
      pendingAmount: data.pendingAmount ?? 0,
      activeProjects: data.activeProjects ?? 0,
      status: data.status ?? 'Active',
    });
    return this.clientRepo.save(client);
  }

  async update(id: string, data: Partial<Client>): Promise<Client> {
    const client = await this.findOne(id);
    Object.assign(client, data);
    return this.clientRepo.save(client);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    await this.clientRepo.remove(client);
  }
}
