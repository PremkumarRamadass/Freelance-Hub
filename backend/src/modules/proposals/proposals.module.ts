import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from '../../entities/proposal.entity.js';
import { Project } from '../../entities/project.entity.js';
import { Notification } from '../../entities/notification.entity.js';
import { User } from '../../entities/user.entity.js';
import { ProposalsService } from './proposals.service.js';
import { ProposalsController } from './proposals.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Proposal, Project, Notification, User])],
  controllers: [ProposalsController],
  providers: [ProposalsService],
  exports: [ProposalsService],
})
export class ProposalsModule {}
