import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  invoiceId: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 50, default: 'UPI' })
  paymentMethod: 'UPI' | 'Bank Transfer' | 'Card';

  @Column({ type: 'varchar', length: 150 })
  referenceNumber: string;

  @Column({ type: 'varchar', length: 50 })
  transactionDate: string;

  @Column({ type: 'varchar', length: 50, default: 'Completed' })
  status: 'Completed' | 'Pending';

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
