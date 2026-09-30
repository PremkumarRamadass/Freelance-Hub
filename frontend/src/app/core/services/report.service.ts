import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import {
  FinancialSummary,
  MonthlyTrend,
  ClientRevenue,
  INITIAL_FINANCIAL_SUMMARY
} from '../models/report.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);

  private readonly _summary = signal<FinancialSummary>(INITIAL_FINANCIAL_SUMMARY);
  private readonly _trends = signal<MonthlyTrend[]>([]);
  private readonly _clientRevenue = signal<ClientRevenue[]>([]);
  private readonly _loading = signal<boolean>(false);

  readonly summary = this._summary.asReadonly();
  readonly trends = this._trends.asReadonly();
  readonly clientRevenue = this._clientRevenue.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor() {
    this.fetchReports();
  }

  fetchReports(): void {
    this._loading.set(true);
    this.http.get<FinancialSummary>(`${API_BASE_URL}/reports/summary`).pipe(
      tap((data: FinancialSummary) => {
        if (data) {
          this._summary.set(data);
        }
        this._loading.set(false);
      }),
      catchError(() => {
        this._loading.set(false);
        return of(this._summary());
      })
    ).subscribe();

    this.http.get<MonthlyTrend[]>(`${API_BASE_URL}/reports/monthly-trends`).pipe(
      tap((data: MonthlyTrend[]) => {
        if (data && data.length > 0) {
          this._trends.set(data);
        }
      }),
      catchError(() => of(this._trends()))
    ).subscribe();

    this.http.get<ClientRevenue[]>(`${API_BASE_URL}/reports/client-revenue`).pipe(
      tap((data: ClientRevenue[]) => {
        if (data && data.length > 0) {
          this._clientRevenue.set(data);
        }
      }),
      catchError(() => of(this._clientRevenue()))
    ).subscribe();
  }

  exportCsvUrl(): string {
    return `${API_BASE_URL}/reports/export-csv`;
  }
}
