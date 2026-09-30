import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 150 })
  client: string;

  @Column({ type: 'varchar', length: 50, default: 'Planning' })
  status: 'Planning' | 'In Progress' | 'In Review' | 'Completed' | 'On Hold';

  @Column({ type: 'varchar', length: 100, nullable: true })
  deadline?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  budget: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  spent: number;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Column({ type: 'int', default: 0 })
  tasksCount: number;

  @Column({ type: 'int', default: 0 })
  completedTasks: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
