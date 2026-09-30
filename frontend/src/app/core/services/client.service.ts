import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, tap, catchError, map, throwError } from 'rxjs';
import { Client, CreateClientDto, BackendClientResponse } from '../models/client.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private readonly _clients = signal<Client[]>([]);
  private readonly _loading = signal<boolean>(false);

  readonly clients = this._clients.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor() {
    this.fetchClients();
  }

  fetchClients(): void {
    this._loading.set(true);
    this.http.get<BackendClientResponse[]>(`${API_BASE_URL}/clients`).pipe(
      tap((data: BackendClientResponse[]) => {
        if (data) {
          const mapped: Client[] = data.map((c: BackendClientResponse) => ({
            id: c.id,
            name: c.name,
            company: c.company,
            email: c.email,
            phone: c.phone || '',
            country: c.country || 'India',
            status: (c.status || 'Active') as Client['status'],
            projectsCount: Number(c.projectsCount ?? c.activeProjects ?? 0),
            totalBilled: Number(c.totalBilled ?? 0),
            avatarUrl: c.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            notes: c.notes || '',
            createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString()
          }));
          this._clients.set(mapped);
        }
        this._loading.set(false);
      }),
      catchError(() => {
        this._loading.set(false);
        return of(this._clients());
      })
    ).subscribe();
  }

  getClients(): Observable<Client[]> {
    return of(this._clients());
  }

  getClientById(id: string): Client | undefined {
    return this._clients().find((c: Client) => c.id === id);
  }

  addClient(dto: CreateClientDto): Observable<Client> {
    const payload = {
      name: dto.name,
      company: dto.company,
      email: dto.email,
      phone: dto.phone,
      country: dto.country || 'India',
      status: 'Active',
      projectsCount: 0,
      totalBilled: 0,
      notes: dto.notes
    };

    return this.http.post<Client>(`${API_BASE_URL}/clients`, payload).pipe(
      tap((created: Client) => {
        const newClient: Client = {
          id: created.id,
          name: created.name,
          company: created.company,
          email: created.email,
          phone: created.phone || dto.phone,
          country: created.country || dto.country || 'India',
          status: created.status || 'Active',
          projectsCount: 0,
          totalBilled: 0,
          notes: dto.notes,
          createdAt: created.createdAt ? new Date(created.createdAt).toISOString() : new Date().toISOString()
        };
        this._clients.update(list => [newClient, ...list]);
      }),
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message || err.message || 'Failed to create client.';
        return throwError(() => new Error(msg));
      })
    );
  }

  updateClient(id: string, dto: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${API_BASE_URL}/clients/${id}`, dto).pipe(
      tap((updated: Client) => {
        this._clients.update(list =>
          list.map(c => (c.id === id ? { ...c, ...dto, ...updated } : c))
        );
      }),
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message || err.message || 'Failed to update client.';
        return throwError(() => new Error(msg));
      })
    );
  }

  deleteClient(id: string): Observable<boolean> {
    return this.http.delete(`${API_BASE_URL}/clients/${id}`).pipe(
      map(() => true),
      tap(() => {
        this._clients.update(list => list.filter(c => c.id !== id));
      }),
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message || err.message || 'Failed to delete client.';
        return throwError(() => new Error(msg));
      })
    );
  }
}
