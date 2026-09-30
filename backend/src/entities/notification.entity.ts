import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 50, default: 'info' })
  type: 'info' | 'success' | 'warning' | 'alert';

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ type: 'varchar', length: 50, default: 'Just now' })
  time: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  targetUrl?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
