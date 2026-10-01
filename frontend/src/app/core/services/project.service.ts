import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, tap, catchError, map, throwError } from 'rxjs';
import {
  Project,
  CreateProjectDto,
  ProjectStatus,
  Priority,
  Proposal,
  SubmitProposalDto,
  BackendProjectResponse,
} from '../models/project.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private http = inject(HttpClient);
  private readonly _projects = signal<Project[]>([]);
  private readonly _loading = signal<boolean>(false);

  readonly projects = this._projects.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly totalProjects = computed(() => this._projects().length);
  readonly activeProjects = computed(() =>
    this._projects().filter(
      p =>
        p.status === 'In Progress' ||
        p.status === 'Planning' ||
        p.status === 'Assigned' ||
        p.status === 'Published',
    ).length,
  );
  readonly completedProjects = computed(() =>
    this._projects().filter(p => p.status === 'Completed').length,
  );
  readonly totalRevenue = computed(() =>
    this._projects().reduce((sum, p) => sum + p.paidAmount, 0),
  );
  readonly pendingPayment = computed(() =>
    this._projects().reduce((sum, p) => sum + Math.max(0, p.budget - p.paidAmount), 0),
  );

  constructor() {
    this.fetchProjects();
  }

  fetchProjects(): void {
    this._loading.set(true);
    this.http
      .get<BackendProjectResponse[]>(`${API_BASE_URL}/projects`)
      .pipe(
        tap((data: BackendProjectResponse[]) => {
          if (data) {
            const mapped: Project[] = data.map((p: BackendProjectResponse) =>
              this.mapBackendResponseToProject(p),
            );
            this._projects.set(mapped);
          }
          this._loading.set(false);
        }),
        catchError(() => {
          this._loading.set(false);
          return of(this._projects());
        }),
      )
      .subscribe();
  }

  mapBackendResponseToProject(p: BackendProjectResponse): Project {
    const skills = Array.isArray(p.requiredSkills)
      ? p.requiredSkills
      : p.tags || ['Angular', 'TypeScript'];

    return {
      id: p.id,
      title: p.name || p.title || 'Untitled Project',
      clientId: p.clientId || 'cli_1',
      clientName: p.client || p.clientName || 'Enterprise Partner',
      clientCompany: p.client || p.clientCompany || 'Enterprise Partner',
      description: p.description || '',
      category: p.category || 'Web App',
      budgetType: p.budgetType || 'Fixed Price',
      budget: Number(p.budget ?? 0),
      minBudget: p.minBudget ? Number(p.minBudget) : undefined,
      maxBudget: p.maxBudget ? Number(p.maxBudget) : Number(p.budget ?? 0),
      paidAmount: Number(p.spent ?? 0),
      status: (p.status || 'Draft') as ProjectStatus,
      priority: (p.priority || 'Medium') as Priority,
      startDate: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '2026-10-01',
      deadline: p.deadline || '2026-12-31',
      progress: Number(p.progress ?? 0),
      requiredSkills: skills,
      attachments: p.attachments || [],
      additionalRequirements: p.additionalRequirements || '',
      assignedFreelancerId: p.assignedFreelancerId,
      assignedFreelancerName: p.assignedFreelancerName,
      assignedFreelancerEmail: p.assignedFreelancerEmail,
      assignedFreelancerAvatar: p.assignedFreelancerAvatar,
      proposalsCount: Number(p.proposalsCount ?? 0),
      tags: skills,
      tasks: [],
      milestones: [],
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
    };
  }

  getProjects(): Observable<Project[]> {
    return of(this._projects());
  }

  getProjectById(id: string): Project | undefined {
    return this._projects().find(p => p.id === id);
  }

  getMarketplaceProjects(filter?: {
    search?: string;
    category?: string;
    skill?: string;
    minBudget?: number;
    maxBudget?: number;
  }): Observable<Project[]> {
    let params = new HttpParams();
    if (filter?.search) params = params.set('search', filter.search);
    if (filter?.category && filter.category !== 'All') params = params.set('category', filter.category);
    if (filter?.skill && filter.skill !== 'All') params = params.set('skill', filter.skill);
    if (filter?.minBudget) params = params.set('minBudget', filter.minBudget.toString());
    if (filter?.maxBudget) params = params.set('maxBudget', filter.maxBudget.toString());

    return this.http.get<BackendProjectResponse[]>(`${API_BASE_URL}/projects/marketplace`, { params }).pipe(
      map(data => data.map(p => this.mapBackendResponseToProject(p))),
      catchError(() => {
        // Fallback to local filter if offline/dev
        const list = this._projects().filter(
          p => p.status === 'Published' || p.status === 'Under Review',
        );
        return of(list);
      }),
    );
  }

  getProjectProposals(projectId: string): Observable<Proposal[]> {
    return this.http
      .get<Proposal[]>(`${API_BASE_URL}/projects/${projectId}/proposals`)
      .pipe(catchError(() => of([])));
  }

  createProject(
    dto: CreateProjectDto,
    clientName: string,
    clientCompany: string,
    statusOverride?: ProjectStatus,
  ): Observable<Project> {
    const budgetVal = Number(dto.budget ?? dto.maxBudget ?? 50000);
    const finalStatus = statusOverride || dto.status || 'Draft';

    const payload = {
      name: dto.title,
      client: clientCompany || clientName,
      clientId: dto.clientId,
      clientName: clientName,
      clientCompany: clientCompany,
      description: dto.description,
      category: dto.category || 'Web App',
      budgetType: dto.budgetType || 'Fixed Price',
      budget: budgetVal,
      minBudget: dto.minBudget ? Number(dto.minBudget) : undefined,
      maxBudget: dto.maxBudget ? Number(dto.maxBudget) : budgetVal,
      spent: 0,
      progress: 0,
      status: finalStatus,
      priority: dto.priority || 'Medium',
      deadline: dto.deadline,
      requiredSkills: dto.requiredSkills || dto.tags || [],
      attachments: dto.attachments || [],
      additionalRequirements: dto.additionalRequirements || '',
    };

    return this.http.post<any>(`${API_BASE_URL}/projects`, payload).pipe(
      map((created: any) => this.mapBackendResponseToProject(created)),
      tap((newProject: Project) => {
        this._projects.update(list => [newProject, ...list.filter(p => p.id !== newProject.id)]);
      }),
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message || err.message || 'Failed to create project.';
        return throwError(() => new Error(msg));
      }),
    );
  }

  updateProject(id: string, data: Partial<Project>): Observable<Project> {
    return this.http.put<any>(`${API_BASE_URL}/projects/${id}`, data).pipe(
      map(updated => this.mapBackendResponseToProject(updated)),
      tap(updatedProj => {
        this._projects.update(list => list.map(p => (p.id === id ? updatedProj : p)));
      }),
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message || err.message || 'Failed to update project.';
        return throwError(() => new Error(msg));
      }),
    );
  }

  updateProjectStatus(projectId: string, status: ProjectStatus): Observable<Project> {
    return this.http.put<any>(`${API_BASE_URL}/projects/${projectId}/status`, { status }).pipe(
      map(updated => this.mapBackendResponseToProject(updated)),
      tap(updatedProj => {
        this._projects.update(list => list.map(p => (p.id === projectId ? updatedProj : p)));
      }),
      catchError((err: HttpErrorResponse) => {
        // Optimistic local fallback
        this._projects.update(projects =>
          projects.map(p => (p.id === projectId ? { ...p, status } : p)),
        );
        const p = this.getProjectById(projectId);
        return p ? of(p) : throwError(() => new Error(err.message));
      }),
    );
  }

  submitProposal(projectId: string, dto: SubmitProposalDto): Observable<Proposal> {
    return this.http.post<Proposal>(`${API_BASE_URL}/projects/${projectId}/proposals`, dto).pipe(
      tap(() => {
        this._projects.update(list =>
          list.map(p =>
            p.id === projectId
              ? {
                  ...p,
                  proposalsCount: (p.proposalsCount || 0) + 1,
                  status: p.status === 'Published' ? 'Under Review' : p.status,
                }
              : p,
          ),
        );
      }),
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message || err.message || 'Failed to submit proposal.';
        return throwError(() => new Error(msg));
      }),
    );
  }

  acceptProposal(proposalId: string, projectId: string): Observable<any> {
    return this.http.put<any>(`${API_BASE_URL}/proposals/${proposalId}/accept`, {}).pipe(
      tap(res => {
        if (res?.project) {
          const mapped = this.mapBackendResponseToProject(res.project);
          this._projects.update(list => list.map(p => (p.id === projectId ? mapped : p)));
        } else {
          this._projects.update(list =>
            list.map(p => (p.id === projectId ? { ...p, status: 'Assigned' } : p)),
          );
        }
      }),
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message || err.message || 'Failed to accept proposal.';
        return throwError(() => new Error(msg));
      }),
    );
  }

  rejectProposal(proposalId: string): Observable<Proposal> {
    return this.http.put<Proposal>(`${API_BASE_URL}/proposals/${proposalId}/reject`, {}).pipe(
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message || err.message || 'Failed to reject proposal.';
        return throwError(() => new Error(msg));
      }),
    );
  }

  getMyProposals(): Observable<Proposal[]> {
    return this.http
      .get<Proposal[]>(`${API_BASE_URL}/proposals/my`)
      .pipe(catchError(() => of([])));
  }

  toggleTaskCompletion(projectId: string, taskId: string): void {
    this._projects.update(projects =>
      projects.map(project => {
        if (project.id === projectId) {
          const updatedTasks = project.tasks.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t,
          );
          const completedCount = updatedTasks.filter(t => t.completed).length;
          const progress =
            updatedTasks.length > 0
              ? Math.round((completedCount / updatedTasks.length) * 100)
              : project.progress;
          return { ...project, tasks: updatedTasks, progress };
        }
        return project;
      }),
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
      }),
    );
  }
}
