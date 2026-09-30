import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 150, default: 'General' })
  project: string;

  @Column({ type: 'varchar', length: 50, default: 'PDF' })
  type: string;

  @Column({ type: 'varchar', length: 50, default: '1.2 MB' })
  size: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  url?: string;

  @Column({ type: 'varchar', length: 50 })
  date: string;

  @Column({ type: 'varchar', length: 50, default: 'pi-file-pdf' })
  icon: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
