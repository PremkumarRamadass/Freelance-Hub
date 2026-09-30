import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ClientsModule } from './modules/clients/clients.module.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import { TasksModule } from './modules/tasks/tasks.module.js';
import { QuotationsModule } from './modules/quotations/quotations.module.js';
import { InvoicesModule } from './modules/invoices/invoices.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';
import { DocumentsModule } from './modules/documents/documents.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    ClientsModule,
    ProjectsModule,
    TasksModule,
    QuotationsModule,
    InvoicesModule,
    DashboardModule,
    ReportsModule,
    DocumentsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
