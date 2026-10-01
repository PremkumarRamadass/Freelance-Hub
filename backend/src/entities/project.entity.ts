import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type ProjectStatus =
  | 'Draft'
  | 'Published'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'In Review'
  | 'Completed'
  | 'Cancelled'
  | 'Closed'
  | 'Planning'
  | 'On Hold';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type BudgetType = 'Fixed Price' | 'Hourly';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 150 })
  client: string;

  @Index()
  @Column({ type: 'varchar', length: 150, nullable: true })
  clientId?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  clientName?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  clientCompany?: string;

  @Column({ type: 'varchar', length: 50, default: 'Draft' })
  status: ProjectStatus;

  @Column({ type: 'varchar', length: 50, default: 'Medium' })
  priority: Priority;

  @Column({ type: 'varchar', length: 50, default: 'Fixed Price' })
  budgetType: BudgetType;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  budget: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  minBudget?: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  maxBudget?: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  spent: number;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deadline?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Column({ type: 'simple-array', nullable: true, default: '' })
  requiredSkills: string[];

  @Column({ type: 'simple-array', nullable: true, default: '' })
  attachments: string[];

  @Column({ type: 'text', nullable: true })
  additionalRequirements?: string;

  @Index()
  @Column({ type: 'varchar', length: 150, nullable: true })
  assignedFreelancerId?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  assignedFreelancerName?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  assignedFreelancerEmail?: string;

  @Column({ type: 'text', nullable: true })
  assignedFreelancerAvatar?: string;

  @Column({ type: 'int', default: 0 })
  proposalsCount: number;

  @Column({ type: 'int', default: 0 })
  tasksCount: number;

  @Column({ type: 'int', default: 0 })
  completedTasks: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
