import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', length: 50, default: 'FREELANCER' })
  role: 'FREELANCER' | 'CLIENT' | 'ADMIN';

  @Column({ type: 'varchar', length: 150, nullable: true })
  companyName?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  title?: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  hourlyRate?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  avatarUrl?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  location?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'jsonb', nullable: true, default: () => "'{}'" })
  preferences?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
