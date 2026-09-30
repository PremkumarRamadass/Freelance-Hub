import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';
import { Project, Client, Invoice, Payment } from '../../entities/index.js';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Client, Invoice, Payment])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
