import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { of, tap, catchError, map, throwError, Observable } from 'rxjs';
import { AppNotification, NotificationType, CreateNotificationDto, BackendNotificationResponse } from '../models/notification.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private readonly _notifications = signal<AppNotification[]>([]);

  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = computed(() => this._notifications().filter(n => !n.read).length);

  constructor() {
    this.fetchNotifications();
  }

  fetchNotifications(): void {
    this.http.get<BackendNotificationResponse[]>(`${API_BASE_URL}/notifications`).pipe(
      tap((data: BackendNotificationResponse[]) => {
        if (data && data.length > 0) {
          const mapped: AppNotification[] = data.map((n: BackendNotificationResponse) => ({
            id: n.id,
            type: (n.type || 'info') as NotificationType,
            title: n.title,
            message: n.message,
            timestamp: n.time || 'Just now',
            read: n.read ?? false,
            link: n.targetUrl || '/dashboard'
          }));
          this._notifications.set(mapped);
        }
      }),
      catchError(() => of(this._notifications()))
    ).subscribe();
  }

  markAllAsRead(): void {
    this.http.patch(`${API_BASE_URL}/notifications/read-all`, {}).pipe(
      catchError(() => of(null))
    ).subscribe();

    this._notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  markAsRead(id: string): void {
    this.http.patch(`${API_BASE_URL}/notifications/${id}/read`, {}).pipe(
      catchError(() => of(null))
    ).subscribe();

    this._notifications.update(list =>
      list.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }

  deleteNotification(id: string): void {
    this.http.delete(`${API_BASE_URL}/notifications/${id}`).pipe(
      catchError(() => of(null))
    ).subscribe();

    this._notifications.update(list => list.filter(n => n.id !== id));
  }

  addNotification(dto: CreateNotificationDto): Observable<AppNotification> {
    const payload = {
      title: dto.title,
      message: dto.message,
      type: dto.type,
      time: dto.time || 'Just now',
      targetUrl: dto.targetUrl
    };

    return this.http.post<any>(`${API_BASE_URL}/notifications`, payload).pipe(
      map((created: any) => {
        const item: AppNotification = {
          id: created.id,
          type: dto.type,
          title: dto.title,
          message: dto.message,
          timestamp: 'Just now',
          read: false,
          link: dto.targetUrl
        };
        this._notifications.update(list => [item, ...list]);
        return item;
      }),
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message || err.message || 'Failed to dispatch notification.';
        return throwError(() => new Error(msg));
      })
    );
  }
}
