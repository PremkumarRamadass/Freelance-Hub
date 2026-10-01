import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { ProjectDetailsComponent } from './project-details.component';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

describe('ProjectDetailsComponent', () => {
  let component: ProjectDetailsComponent;
  let fixture: ComponentFixture<ProjectDetailsComponent>;
  let projectService: ProjectService;

  const mockProject: Project = {
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
    requiredSkills: ['Angular', 'NestJS'],
    proposalsCount: 1,
    tags: ['Angular', 'NestJS'],
    tasks: [{ id: 'task_1', title: 'Setup Repo', completed: true, priority: 'High' }],
    milestones: [],
    createdAt: '2026-09-01'
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ProjectDetailsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDetailsComponent);
    component = fixture.componentInstance;
    projectService = TestBed.inject(ProjectService);

    (projectService as any)._projects.set([mockProject]);
    fixture.componentRef.setInput('id', 'prj_1');
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize and display matching project', () => {
    expect(component).toBeTruthy();
    expect(component.project()?.id).toBe('prj_1');
    expect(component.project()?.title).toBe('E-Commerce Platform');
  });

  it('should switch active tabs', () => {
    expect(component.activeTab()).toBe('overview');
    component.activeTab.set('tasks');
    expect(component.activeTab()).toBe('tasks');
  });

  it('should toggle task completion via projectService', () => {
    const toggleSpy = vi.spyOn(projectService, 'toggleTaskCompletion');
    component.toggleTask('task_1');
    expect(toggleSpy).toHaveBeenCalledWith('prj_1', 'task_1');
  });

  it('should toggle proposal modal visibility', () => {
    component.openProposalModal();
    expect(component.showProposalModal()).toBe(true);

    component.closeProposalModal();
    expect(component.showProposalModal()).toBe(false);
  });

  it('should accept proposal via projectService.acceptProposal', () => {
    const mockProposal: any = { id: 'prop_123', freelancerName: 'Alice', proposedPrice: 10000 };
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const acceptSpy = vi.spyOn(projectService, 'acceptProposal').mockReturnValue(of({} as any));
    component.acceptProposal(mockProposal);
    expect(acceptSpy).toHaveBeenCalledWith('prop_123', 'prj_1');
  });

  it('should reject proposal via projectService.rejectProposal', () => {
    const mockProposal: any = { id: 'prop_123', freelancerName: 'Alice', proposedPrice: 10000 };
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const rejectSpy = vi.spyOn(projectService, 'rejectProposal').mockReturnValue(of({} as any));
    component.rejectProposal(mockProposal);
    expect(rejectSpy).toHaveBeenCalledWith('prop_123');
  });
});
