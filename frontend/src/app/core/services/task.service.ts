import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, tap, catchError, throwError } from 'rxjs';
import { Task, CreateTaskDto, TaskStatus, TaskPriority, BackendTaskResponse } from '../models/task.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private readonly _tasks = signal<Task[]>([]);
  readonly tasks = this._tasks.asReadonly();

  constructor() {
    this.fetchTasks();
  }

  fetchTasks(): void {
    this.http.get<BackendTaskResponse[]>(`${API_BASE_URL}/tasks`).pipe(
      tap((data: BackendTaskResponse[]) => {
        if (data) {
          const mapped: Task[] = data.map((t: BackendTaskResponse) => ({
            id: t.id,
            projectId: t.projectId || 'prj_1',
            projectName: t.projectName || 'Contract Deliverable',
            title: t.title,
            description: t.description || 'Sprint task deliverable',
            assignee: t.assignee || 'Premkumar',
            assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            dueDate: t.dueDate || '28 Oct 2026',
            status: (t.status || 'Pending') as TaskStatus,
            priority: (t.priority || 'Medium') as TaskPriority
          }));
          this._tasks.set(mapped);
        }
      }),
      catchError(() => of(this._tasks()))
    ).subscribe();
  }

  getTasks(): Observable<Task[]> {
    return of(this._tasks());
  }

  addTask(dto: CreateTaskDto): Observable<Task> {
    const payload = {
      title: dto.title,
      description: dto.description,
      projectName: 'Sprint Delivery',
      dueDate: dto.dueDate,
      priority: dto.priority,
      status: dto.status,
      assignee: dto.assignee
    };

    return this.http.post<any>(`${API_BASE_URL}/tasks`, payload).pipe(
      tap((created: any) => {
        const newTask: Task = {
          id: created.id,
          projectId: dto.projectId,
          projectName: created.projectName || 'Sprint Delivery',
          title: created.title || dto.title,
          description: dto.description,
          assignee: dto.assignee,
          assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          dueDate: dto.dueDate,
          status: dto.status,
          priority: dto.priority
        };
        this._tasks.update(list => [newTask, ...list]);
      }),
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message || err.message || 'Failed to create task.';
        return throwError(() => new Error(msg));
      })
    );
  }

  updateTaskStatus(id: string, status: TaskStatus): void {
    this.http.patch(`${API_BASE_URL}/tasks/${id}/toggle`, {}).pipe(
      catchError(() => of(null))
    ).subscribe();

    this._tasks.update(list =>
      list.map(t => (t.id === id ? { ...t, status } : t))
    );
  }

  deleteTask(id: string): void {
    this.http.delete(`${API_BASE_URL}/tasks/${id}`).pipe(
      catchError(() => of(null))
    ).subscribe();

    this._tasks.update(list => list.filter(t => t.id !== id));
  }
}
