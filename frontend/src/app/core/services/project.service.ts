import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, tap, catchError, map, throwError } from 'rxjs';
import { Project, CreateProjectDto, ProjectStatus, Priority, BackendProjectResponse } from '../models/project.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);
  private readonly _projects = signal<Project[]>([]);
  private readonly _loading = signal<boolean>(false);

  readonly projects = this._projects.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly totalProjects = computed(() => this._projects().length);
  readonly activeProjects = computed(() =>
    this._projects().filter(p => p.status === 'In Progress' || p.status === 'Planning').length
  );
  readonly completedProjects = computed(() =>
    this._projects().filter(p => p.status === 'Completed').length
  );
  readonly totalRevenue = computed(() =>
    this._projects().reduce((sum, p) => sum + p.paidAmount, 0)
  );
  readonly pendingPayment = computed(() =>
    this._projects().reduce((sum, p) => sum + Math.max(0, p.budget - p.paidAmount), 0)
  );

  constructor() {
    this.fetchProjects();
  }

  fetchProjects(): void {
    this._loading.set(true);
    this.http.get<BackendProjectResponse[]>(`${API_BASE_URL}/projects`).pipe(
      tap((data: BackendProjectResponse[]) => {
        if (data) {
          const mapped: Project[] = data.map((p: BackendProjectResponse) => ({
            id: p.id,
            title: p.name || p.title || 'Untitled Project',
            clientId: p.clientId || 'cli_1',
            clientName: p.client || p.clientName || 'Enterprise Partner',
            clientCompany: p.client || p.clientCompany || 'Enterprise Partner',
            description: p.description || '',
            budget: Number(p.budget ?? 0),
            paidAmount: Number(p.spent ?? 0),
            status: (p.status || 'Planning') as ProjectStatus,
            priority: (p.priority || 'High') as Priority,
            startDate: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '2026-09-01',
            deadline: p.deadline || '2026-11-30',
            progress: Number(p.progress ?? 0),
            tags: p.tags || ['Web App', 'TypeScript'],
            tasks: [],
            milestones: [],
            createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString()
          }));
          this._projects.set(mapped);
        }
        this._loading.set(false);
      }),
      catchError(() => {
        this._loading.set(false);
        return of(this._projects());
      })
    ).subscribe();
  }

  getProjects(): Observable<Project[]> {
    return of(this._projects());
  }

  getProjectById(id: string): Project | undefined {
    return this._projects().find(p => p.id === id);
  }

  createProject(dto: CreateProjectDto, clientName: string, clientCompany: string): Observable<Project> {
    const payload = {
      name: dto.title,
      client: clientCompany || clientName,
      description: dto.description,
      budget: Number(dto.budget),
      spent: 0,
      progress: 0,
      status: 'Planning',
      deadline: dto.deadline
    };

    return this.http.post<any>(`${API_BASE_URL}/projects`, payload).pipe(
      tap((created: any) => {
        const newProject: Project = {
          id: created.id,
          title: created.name || dto.title,
          clientId: dto.clientId,
          clientName: clientName,
          clientCompany: clientCompany,
          description: dto.description,
          budget: Number(dto.budget),
          paidAmount: 0,
          status: 'Planning',
          priority: dto.priority,
          startDate: dto.startDate,
          deadline: dto.deadline,
          progress: 0,
          tags: dto.tags || ['Web'],
          tasks: [],
          milestones: [],
          createdAt: created.createdAt ? new Date(created.createdAt).toISOString() : new Date().toISOString()
        };
        this._projects.update(list => [newProject, ...list]);
      }),
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message || err.message || 'Failed to create project.';
        return throwError(() => new Error(msg));
      })
    );
  }

  toggleTaskCompletion(projectId: string, taskId: string): void {
    this._projects.update(projects =>
      projects.map(project => {
        if (project.id === projectId) {
          const updatedTasks = project.tasks.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          );
          const completedCount = updatedTasks.filter(t => t.completed).length;
          const progress = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : project.progress;
          return { ...project, tasks: updatedTasks, progress };
        }
        return project;
      })
    );
  }

  updateProjectStatus(projectId: string, status: ProjectStatus): void {
    this.http.put(`${API_BASE_URL}/projects/${projectId}`, { status }).pipe(
      catchError(() => of(null))
    ).subscribe();

    this._projects.update(projects =>
      projects.map(p => (p.id === projectId ? { ...p, status } : p))
    );
  }

  deleteProject(id: string): Observable<boolean> {
    return this.http.delete(`${API_BASE_URL}/projects/${id}`).pipe(
      map(() => true),
      tap(() => {
        this._projects.update(list => list.filter(p => p.id !== id));
      }),
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message || err.message || 'Failed to delete project.';
        return throwError(() => new Error(msg));
      })
    );
  }
}
