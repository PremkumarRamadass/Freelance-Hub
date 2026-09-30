import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, tap, catchError, map, throwError } from 'rxjs';
import { Quotation, QuotationStatus, CreateQuotationDto, QuotationClientInfo, BackendQuotationResponse } from '../models/quotation.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private http = inject(HttpClient);
  private readonly _quotations = signal<Quotation[]>([]);

  readonly quotations = this._quotations.asReadonly();

  constructor() {
    this.fetchQuotations();
  }

  fetchQuotations(): void {
    this.http.get<BackendQuotationResponse[]>(`${API_BASE_URL}/quotations`).pipe(
      tap((data: BackendQuotationResponse[]) => {
        if (data && data.length > 0) {
          const mapped: Quotation[] = data.map((q: BackendQuotationResponse) => ({
            id: q.id,
            quotationNumber: q.quoteNumber || q.quotationNumber || 'QT-2026-001',
            clientId: q.clientId || 'cli_1',
            clientName: q.clientName,
            clientCompany: q.clientName,
            clientEmail: q.clientEmail,
            projectTitle: q.notes || 'Enterprise Contract Delivery',
            issueDate: q.date || '2026-10-01',
            validUntil: q.validUntil || '2026-11-01',
            items: q.items || [],
            subtotal: Number(q.subtotal ?? 0),
            taxPercent: Number(q.gstRate ?? 18),
            taxAmount: Number(q.gstAmount ?? 0),
            discount: 0,
            total: Number(q.totalAmount ?? 0),
            status: (q.status === 'Approved' ? 'Accepted' : q.status || 'Draft') as QuotationStatus,
            notes: q.notes || '',
            createdAt: q.createdAt ? new Date(q.createdAt).toISOString() : new Date().toISOString()
          }));
          this._quotations.set(mapped);
        }
      }),
      catchError(() => of(this._quotations()))
    ).subscribe();
  }

  getQuotations(): Observable<Quotation[]> {
    return of(this._quotations());
  }

  getQuotationById(id: string): Quotation | undefined {
    return this._quotations().find((q: Quotation) => q.id === id);
  }

  createQuotation(dto: CreateQuotationDto, client: QuotationClientInfo): Observable<Quotation> {
    const calculatedItems = dto.items.map((item, idx) => ({
      id: String(idx + 1),
      description: item.description,
      quantity: Number(item.quantity) || 1,
      rate: Number(item.rate) || 0,
      amount: (Number(item.quantity) || 1) * (Number(item.rate) || 0)
    }));

    const subtotal = calculatedItems.reduce((acc, it) => acc + it.amount, 0);
    const discount = Number(dto.discount) || 0;
    const taxableAmount = Math.max(0, subtotal - discount);
    const taxPercent = Number(dto.taxPercent) || 18;
    const taxAmount = (taxableAmount * taxPercent) / 100;
    const total = taxableAmount + taxAmount;

    const count = this._quotations().length + 1;
    const quotationNumber = `QT-2026-${count.toString().padStart(3, '0')}`;

    const payload = {
      quoteNumber: quotationNumber,
      clientName: client.name,
      clientEmail: client.email,
      date: new Date().toISOString().split('T')[0],
      validUntil: dto.validUntil,
      subtotal,
      gstRate: taxPercent,
      gstAmount: taxAmount,
      totalAmount: total,
      status: 'Draft',
      notes: dto.notes || 'Thank you for your business.',
      items: calculatedItems
    };

    return this.http.post<any>(`${API_BASE_URL}/quotations`, payload).pipe(
      map((created: any) => {
        const newQuotation: Quotation = {
          id: created.id,
          quotationNumber: created.quoteNumber || quotationNumber,
          clientId: dto.clientId,
          clientName: client.name,
          clientCompany: client.company,
          clientEmail: client.email,
          projectTitle: dto.projectTitle,
          issueDate: new Date().toISOString().split('T')[0],
          validUntil: dto.validUntil,
          items: calculatedItems,
          subtotal,
          taxPercent,
          taxAmount,
          discount,
          total,
          status: 'Draft',
          notes: dto.notes || 'Thank you for your business.',
          createdAt: created.createdAt ? new Date(created.createdAt).toISOString() : new Date().toISOString()
        };
        this._quotations.update(list => [newQuotation, ...list]);
        return newQuotation;
      }),
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message || err.message || 'Failed to create quotation.';
        return throwError(() => new Error(msg));
      })
    );
  }

  updateStatus(id: string, status: QuotationStatus): void {
    const endpoint = status === 'Accepted' ? 'approve' : 'reject';
    this.http.patch(`${API_BASE_URL}/quotations/${id}/${endpoint}`, {}).pipe(
      catchError(() => of(null))
    ).subscribe();

    this._quotations.update(list =>
      list.map(q => (q.id === id ? { ...q, status } : q))
    );
  }

  deleteQuotation(id: string): Observable<boolean> {
    return this.http.delete(`${API_BASE_URL}/quotations/${id}`).pipe(
      map(() => true),
      tap(() => {
        this._quotations.update(list => list.filter(q => q.id !== id));
      }),
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message || err.message || 'Failed to delete quotation.';
        return throwError(() => new Error(msg));
      })
    );
  }
}
