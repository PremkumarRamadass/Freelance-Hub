import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 150 })
  company: string;

  @Column({ type: 'varchar', length: 150 })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 50, default: 'Active' })
  status: 'Active' | 'Inactive';

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalBilled: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalPaid: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  pendingAmount: number;

  @Column({ type: 'int', default: 0 })
  activeProjects: number;

  @Column({ type: 'int', default: 0 })
  projectsCount: number;

  @Column({ type: 'varchar', length: 100, default: 'India' })
  country: string;

  @Column({ type: 'text', nullable: true })
  avatarUrl?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
