import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

@Entity('quotations')
export class Quotation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  quoteNumber: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  clientId?: string;

  @Column({ type: 'varchar', length: 150 })
  clientName: string;

  @Column({ type: 'varchar', length: 150 })
  clientEmail: string;

  @Column({ type: 'varchar', length: 50 })
  date: string;

  @Column({ type: 'varchar', length: 50 })
  validUntil: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 18 })
  gstRate: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  gstAmount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'varchar', length: 50, default: 'Draft' })
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  items: QuotationItem[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
