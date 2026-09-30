import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type ProposalStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Accepted'
  | 'Rejected'
  | 'Closed';

@Entity('proposals')
export class Proposal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'varchar', length: 200 })
  projectTitle: string;

  @Index()
  @Column({ type: 'varchar', length: 150 })
  freelancerId: string;

  @Column({ type: 'varchar', length: 150 })
  freelancerName: string;

  @Column({ type: 'varchar', length: 150 })
  freelancerEmail: string;

  @Column({ type: 'text', nullable: true })
  freelancerAvatar?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  proposedPrice: number;

  @Column({ type: 'varchar', length: 100 })
  estimatedDelivery: string;

  @Column({ type: 'text' })
  coverLetter: string;

  @Column({ type: 'text', nullable: true })
  relevantExperience?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  attachments?: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'Submitted',
  })
  status: ProposalStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
