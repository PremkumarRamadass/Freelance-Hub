import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller.js';
import { DocumentsService } from './documents.service.js';
import { Document } from '../../entities/document.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Document])],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
