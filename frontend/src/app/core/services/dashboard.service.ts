import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, tap, catchError } from 'rxjs';
import {
  DashboardStats,
  ClientPortalStats,
  BackendDashboardResponse,
  INITIAL_DASHBOARD_STATS,
  INITIAL_CLIENT_PORTAL_STATS
} from '../models/dashboard.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);

  private readonly _stats = signal<DashboardStats>(INITIAL_DASHBOARD_STATS);
  private readonly _portal = signal<ClientPortalStats>(INITIAL_CLIENT_PORTAL_STATS);
  private readonly _loading = signal<boolean>(false);

  readonly stats = this._stats.asReadonly();
  readonly portal = this._portal.asReadonly();
  readonly loading = this._loading.asReadonly();

  fetchStats(): void {
    this._loading.set(true);
    this.http.get<BackendDashboardResponse>(`${API_BASE_URL}/dashboard/stats`).pipe(
      tap((data: BackendDashboardResponse) => {
        if (data) {
          const kpis = data.kpis || {};
          this._stats.set({
            totalProjects: Number(kpis.totalProjects ?? 0),
            activeProjects: Number(kpis.activeProjects ?? 0),
            completedProjects: Number(kpis.completedProjects ?? 0),
            totalRevenue: Number(kpis.totalRevenue ?? 0),
            pendingAmount: Number(kpis.pendingAmount ?? 0),
            clientsCount: Number(kpis.clientsCount ?? 0),
            quotationsCount: Number(kpis.quotationsCount ?? 0),
            tasks: data.tasks,
            monthlyData: data.monthlyData || [],
            recentProjects: data.recentProjects || [],
            recentInvoices: data.recentInvoices || [],
            recentQuotations: data.recentQuotations || [],
            recentPayments: data.recentPayments || []
          });
        }
        this._loading.set(false);
      }),
      catchError(() => {
        this._loading.set(false);
        return of(this._stats());
      })
    ).subscribe();
  }

  fetchClientPortal(email: string): void {
    this._loading.set(true);
    this.http.get<ClientPortalStats>(`${API_BASE_URL}/dashboard/client-portal/${encodeURIComponent(email)}`).pipe(
      tap((data: ClientPortalStats) => {
        if (data) {
          this._portal.set(data);
        }
        this._loading.set(false);
      }),
      catchError(() => {
        this._loading.set(false);
        return of(this._portal());
      })
    ).subscribe();
  }
}
