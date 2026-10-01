import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 150 })
  userId: string;

  @Column({ type: 'varchar', length: 150 })
  userName: string;

  @Column({ type: 'varchar', length: 50, default: 'user' })
  senderRole: 'user' | 'assistant' | 'system';

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 100, default: 'ai-assistant' })
  channel: string;

  @Column({ type: 'jsonb', nullable: true, default: () => "'{}'" })
  metadata?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
