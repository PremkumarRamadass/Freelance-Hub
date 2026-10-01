import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  User,
  Client,
  Project,
  Task,
  Quotation,
  Invoice,
  Payment,
  Document,
  Notification,
  Proposal,
  ChatMessage,
} from '../entities/index.js';
import { DatabaseSeedService } from './database-seed.service.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const isSsl = config.get<string>('DB_SSL') === 'true';

        if (databaseUrl && !databaseUrl.includes('localhost') && !databaseUrl.includes('127.0.0.1')) {
          return {
            type: 'postgres',
            url: databaseUrl,
            ssl: { rejectUnauthorized: false },
            autoLoadEntities: true,
            synchronize: true, // Automatically creates & updates tables
            logging: ['error', 'warn'],
          };
        }

        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.get<string>('DB_USERNAME', 'postgres'),
          password: config.get<string>('DB_PASSWORD', 'postgres'),
          database: config.get<string>('DB_DATABASE', 'freelancehub_db'),
          ssl: isSsl ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          synchronize: true, // Automatically creates & updates tables
          logging: ['error', 'warn'],
        };
      },
    }),
    TypeOrmModule.forFeature([
      User,
      Client,
      Project,
      Task,
      Quotation,
      Invoice,
      Payment,
      Document,
      Notification,
      Proposal,
      ChatMessage,
    ]),
  ],
  providers: [DatabaseSeedService],
  exports: [TypeOrmModule, DatabaseSeedService],
})
export class DatabaseModule {}
