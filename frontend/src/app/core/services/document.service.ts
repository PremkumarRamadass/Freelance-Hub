import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, tap, catchError, map, throwError } from 'rxjs';
import { DocumentItem, CreateDocumentDto, BackendDocumentResponse } from '../models/document.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private http = inject(HttpClient);
  private readonly _documents = signal<DocumentItem[]>([]);

  readonly documents = this._documents.asReadonly();

  constructor() {
    this.fetchDocuments();
  }

  fetchDocuments(): void {
    this.http.get<BackendDocumentResponse[]>(`${API_BASE_URL}/documents`).pipe(
      tap((data: BackendDocumentResponse[]) => {
        if (data && data.length > 0) {
          const mapped: DocumentItem[] = data.map((d: BackendDocumentResponse) => ({
            id: d.id,
            name: d.name,
            project: d.project || 'General',
            type: d.type || 'PDF',
            size: d.size || '1.2 MB',
            date: d.date || '01 Oct 2026',
            icon: d.icon || (d.type === 'PDF' ? 'pi-file-pdf' : 'pi-file-word'),
            url: d.url
          }));
          this._documents.set(mapped);
        }
      }),
      catchError(() => of(this._documents()))
    ).subscribe();
  }

  addDocument(doc: CreateDocumentDto): Observable<DocumentItem> {
    return this.http.post<any>(`${API_BASE_URL}/documents`, doc).pipe(
      map((created: any) => {
        const item: DocumentItem = { ...doc, id: created.id };
        this._documents.update(list => [item, ...list]);
        return item;
      }),
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message || err.message || 'Failed to upload document.';
        return throwError(() => new Error(msg));
      })
    );
  }

  deleteDocument(id: string): void {
    this.http.delete(`${API_BASE_URL}/documents/${id}`).pipe(
      catchError(() => of(null))
    ).subscribe();

    this._documents.update(list => list.filter(d => d.id !== id));
  }
}
