import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quotation } from '../../entities/quotation.entity.js';
import { QuotationsService } from './quotations.service.js';
import { QuotationsController } from './quotations.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Quotation])],
  controllers: [QuotationsController],
  providers: [QuotationsService],
  exports: [QuotationsService],
})
export class QuotationsModule {}
