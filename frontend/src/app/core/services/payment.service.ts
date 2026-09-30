import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, tap, catchError, map, throwError } from 'rxjs';
import { Payment, PaymentStatus, PaymentMethod, CreatePaymentDto, BackendInvoiceResponse } from '../models/payment.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private readonly _payments = signal<Payment[]>([]);

  readonly payments = this._payments.asReadonly();

  readonly totalReceived = computed(() =>
    this._payments()
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0)
  );

  readonly totalPending = computed(() =>
    this._payments()
      .filter(p => p.status === 'Pending')
      .reduce((sum, p) => sum + p.amount, 0)
  );

  constructor() {
    this.fetchInvoices();
  }

  fetchInvoices(): void {
    this.http.get<BackendInvoiceResponse[]>(`${API_BASE_URL}/invoices`).pipe(
      tap((data: BackendInvoiceResponse[]) => {
        if (data && data.length > 0) {
          const mapped: Payment[] = data.map((inv: BackendInvoiceResponse) => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            projectId: inv.projectId || 'prj_1',
            projectTitle: 'Website Development & Redesign',
            clientId: inv.clientId || 'cli_1',
            clientName: inv.clientName || 'Rahul Sharma',
            clientCompany: inv.clientName || 'ABC Pvt Ltd',
            amount: Number(inv.totalAmount ?? 0),
            paymentDate: inv.status === 'Paid' ? inv.dueDate : undefined,
            dueDate: inv.dueDate || '2026-11-30',
            status: (inv.status || 'Pending') as PaymentStatus,
            method: (inv.paymentMethod || 'UPI') as PaymentMethod,
            transactionRef: inv.status === 'Paid' ? `UPI/2026/${Math.floor(10000000 + Math.random() * 90000000)}` : undefined,
            notes: `GST Invoice ${inv.invoiceNumber}`,
            createdAt: inv.createdAt ? new Date(inv.createdAt).toISOString() : new Date().toISOString()
          }));
          this._payments.set(mapped);
        }
      }),
      catchError(() => of(this._payments()))
    ).subscribe();
  }

  getPayments(): Observable<Payment[]> {
    return of(this._payments());
  }

  markAsPaid(id: string, method: PaymentMethod = 'UPI', transactionRef?: string): void {
    const ref = transactionRef || `UPI/2026/${Math.floor(10000000 + Math.random() * 90000000)}`;

    this.http.post(`${API_BASE_URL}/invoices/${id}/pay`, {
      paymentMethod: method,
      referenceNumber: ref
    }).pipe(
      catchError(() => of(null))
    ).subscribe();

    this._payments.update(list =>
      list.map(p =>
        p.id === id
          ? {
              ...p,
              status: 'Paid' as PaymentStatus,
              paymentDate: new Date().toISOString().split('T')[0],
              method: method || 'UPI',
              transactionRef: ref
            }
          : p
      )
    );
  }

  createPayment(dto: CreatePaymentDto): Observable<Payment> {
    const payload = {
      invoiceNumber: dto.invoiceNumber,
      clientName: dto.clientName,
      totalAmount: dto.amount,
      dueDate: dto.dueDate,
      status: dto.status,
      paymentMethod: dto.method || 'UPI'
    };

    return this.http.post<any>(`${API_BASE_URL}/invoices`, payload).pipe(
      map((created: any) => {
        const newPayment: Payment = {
          id: created.id,
          invoiceNumber: dto.invoiceNumber,
          projectId: dto.projectId,
          projectTitle: dto.projectTitle,
          clientId: dto.clientId,
          clientName: dto.clientName,
          clientCompany: dto.clientCompany,
          amount: dto.amount,
          dueDate: dto.dueDate,
          status: dto.status,
          method: dto.method,
          notes: dto.notes,
          createdAt: created.createdAt ? new Date(created.createdAt).toISOString() : new Date().toISOString()
        };
        this._payments.update(list => [newPayment, ...list]);
        return newPayment;
      }),
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message || err.message || 'Failed to issue invoice.';
        return throwError(() => new Error(msg));
      })
    );
  }
}
