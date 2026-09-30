export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue' | 'Refunded';
export type PaymentMethod = 'UPI' | 'Bank Transfer' | 'Stripe' | 'PayPal' | 'Cash';

export interface Payment {
  id: string;
  invoiceNumber: string;
  projectId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  amount: number;
  paymentDate?: string;
  dueDate: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  transactionRef?: string;
  notes?: string;
  createdAt: string;
}

export interface CreatePaymentDto {
  invoiceNumber: string;
  projectId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  notes?: string;
  method?: PaymentMethod;
}

export interface BackendInvoiceResponse {
  id: string;
  invoiceNumber: string;
  projectId?: string;
  clientId?: string;
  clientName?: string;
  totalAmount?: number;
  dueDate?: string;
  status?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt?: string;
}
