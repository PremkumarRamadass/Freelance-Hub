import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  invoiceNumber: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  clientId?: string;

  @Column({ type: 'varchar', length: 150 })
  clientName: string;

  @Column({ type: 'varchar', length: 150 })
  clientEmail: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  projectId?: string;

  @Column({ type: 'varchar', length: 50 })
  issueDate: string;

  @Column({ type: 'varchar', length: 50 })
  dueDate: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  balanceAmount: number;

  @Column({ type: 'varchar', length: 50, default: 'Draft' })
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentMethod?: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  items: InvoiceItem[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
