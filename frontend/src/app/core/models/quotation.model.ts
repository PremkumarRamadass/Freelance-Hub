export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface QuotationClientInfo {
  name: string;
  company: string;
  email: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  projectTitle: string;
  issueDate: string;
  validUntil: string;
  items: QuotationItem[];
  subtotal: number;
  taxPercent: number; // e.g. 18% GST
  taxAmount: number;
  discount: number;
  total: number;
  status: QuotationStatus;
  notes?: string;
  terms?: string;
  createdAt: string;
}

export interface CreateQuotationDto {
  clientId: string;
  projectTitle: string;
  validUntil: string;
  items: Omit<QuotationItem, 'id' | 'amount'>[];
  taxPercent: number;
  discount?: number;
  notes?: string;
}

export interface BackendQuotationResponse {
  id: string;
  quoteNumber?: string;
  quotationNumber?: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  date?: string;
  validUntil?: string;
  items?: QuotationItem[];
  subtotal?: number;
  gstRate?: number;
  gstAmount?: number;
  totalAmount?: number;
  status?: string;
  notes?: string;
  createdAt?: string;
}
