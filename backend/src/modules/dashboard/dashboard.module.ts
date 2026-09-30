import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Project,
  Client,
  Task,
  Invoice,
  Quotation,
  Payment,
} from '../../entities/index.js';
import { DashboardService } from './dashboard.service.js';
import { DashboardController } from './dashboard.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Client,
      Task,
      Invoice,
      Quotation,
      Payment,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
