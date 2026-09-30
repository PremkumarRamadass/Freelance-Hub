import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { ProjectsComponent } from './projects.component';
import { ProjectService } from '../../core/services/project.service';
import { ClientService } from '../../core/services/client.service';
import { Project } from '../../core/models/project.model';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;
  let projectService: ProjectService;
  let clientService: ClientService;
  let messageService: MessageService;

  const mockProjects: Project[] = [
    {
      id: 'prj_1',
      title: 'E-Commerce Platform',
      clientId: 'cli_1',
      clientName: 'Rahul Sharma',
      clientCompany: 'ABC Pvt Ltd',
      description: 'Modern storefront',
      budget: 150000,
      paidAmount: 50000,
      startDate: '2026-09-01',
      deadline: '2026-11-30',
      status: 'In Progress',
      priority: 'High',
      progress: 65,
      tags: ['Angular', 'NestJS'],
      tasks: [],
      milestones: [],
      createdAt: '2026-09-01'
    },
    {
      id: 'prj_2',
      title: 'Mobile App API',
      clientId: 'cli_2',
      clientName: 'Sarah Connor',
      clientCompany: 'Cyberdyne',
      description: 'Backend API',
      budget: 80000,
      paidAmount: 20000,
      startDate: '2026-09-10',
      deadline: '2026-12-15',
      status: 'Planning',
      priority: 'Medium',
      progress: 20,
      tags: ['Node.js'],
      tasks: [],
      milestones: [],
      createdAt: '2026-09-10'
    }
  ];

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    projectService = TestBed.inject(ProjectService);
    clientService = TestBed.inject(ClientService);
    messageService = TestBed.inject(MessageService);

    (projectService as any)._projects.set(mockProjects);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize and list all projects', () => {
    expect(component).toBeTruthy();
    expect(component.filteredProjects().length).toBe(2);
  });

  it('should filter projects by keyword search and status', () => {
    component.searchQuery.set('e-commerce');
    expect(component.filteredProjects().length).toBe(1);
    expect(component.filteredProjects()[0].id).toBe('prj_1');

    component.searchQuery.set('');
    component.selectedStatus.set('Planning');
    expect(component.filteredProjects().length).toBe(1);
    expect(component.filteredProjects()[0].id).toBe('prj_2');
  });

  it('should handle modal opening and closing', () => {
    component.openAddModal();
    expect(component.showModal()).toBe(true);

    component.closeModal();
    expect(component.showModal()).toBe(false);
  });

  it('should save a project via projectService.createProject', () => {
    const createSpy = vi.spyOn(projectService, 'createProject').mockReturnValue(of({} as any));
    const msgSpy = vi.spyOn(messageService, 'add');

    component.projectForm.patchValue({
      title: 'New Website',
      clientId: 'cli_1',
      budget: 50000,
      deadline: '2026-12-31'
    });

    component.saveProject();

    expect(createSpy).toHaveBeenCalled();
    expect(msgSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    expect(component.showModal()).toBe(false);
  });
});
