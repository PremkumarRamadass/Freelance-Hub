import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 250 })
  title: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  projectId?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  projectName?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  client?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  dueDate?: string;

  @Column({ type: 'varchar', length: 50, default: 'Medium' })
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';

  @Column({ type: 'varchar', length: 50, default: 'Pending' })
  status: 'Pending' | 'In Progress' | 'Completed';

  @Column({ type: 'int', default: 0 })
  estimatedHours: number;

  @Column({ type: 'int', default: 0 })
  loggedHours: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
