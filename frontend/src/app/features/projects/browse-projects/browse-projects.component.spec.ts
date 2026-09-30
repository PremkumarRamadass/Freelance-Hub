import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { BrowseProjectsComponent } from './browse-projects.component';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService } from 'primeng/api';
import { Project } from '../../../core/models/project.model';

describe('BrowseProjectsComponent', () => {
  let component: BrowseProjectsComponent;
  let fixture: ComponentFixture<BrowseProjectsComponent>;
  let projectService: ProjectService;
  let messageService: MessageService;

  const mockPublishedProject: Project = {
    id: 'prj_pub_1',
    title: 'Cloud DevOps Pipeline',
    clientId: 'cli_1',
    clientName: 'Rahul Sharma',
    clientCompany: 'ABC Pvt Ltd',
    description: 'Automated CI/CD with Kubernetes and Docker on AWS cloud.',
    category: 'DevOps & Cloud',
    budgetType: 'Fixed Price',
    budget: 65000,
    paidAmount: 0,
    status: 'Published',
    priority: 'High',
    startDate: '2026-10-01',
    deadline: '2026-12-15',
    progress: 0,
    requiredSkills: ['Docker', 'AWS', 'Kubernetes'],
    proposalsCount: 2,
    tasks: [],
    milestones: [],
    tags: ['DevOps'],
    createdAt: '2026-09-20',
  };

  const mockDraftProject: Project = {
    id: 'prj_draft_1',
    title: 'Internal Analytics',
    clientId: 'cli_1',
    clientName: 'Rahul Sharma',
    clientCompany: 'ABC Pvt Ltd',
    description: 'Internal reporting system.',
    category: 'Web App',
    budget: 35000,
    paidAmount: 0,
    status: 'Draft',
    priority: 'Low',
    startDate: '2026-10-01',
    deadline: '2026-11-01',
    progress: 0,
    requiredSkills: ['Angular'],
    proposalsCount: 0,
    tasks: [],
    milestones: [],
    tags: ['Web'],
    createdAt: '2026-09-20',
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [BrowseProjectsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BrowseProjectsComponent);
    component = fixture.componentInstance;
    projectService = TestBed.inject(ProjectService);
    messageService = TestBed.inject(MessageService);

    // Populate projects signal with mock data
    (projectService as any)._projects.set([mockPublishedProject, mockDraftProject]);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize and display only published or under review projects', () => {
    expect(component).toBeTruthy();
    const published = component.publishedProjects();
    expect(published.length).toBe(1);
    expect(published[0].id).toBe('prj_pub_1');
    expect(published[0].status).toBe('Published');
  });

  it('should filter marketplace projects by category', () => {
    component.selectedCategory.set('Mobile Apps');
    expect(component.publishedProjects().length).toBe(0);

    component.selectedCategory.set('DevOps & Cloud');
    expect(component.publishedProjects().length).toBe(1);
  });

  it('should open and close proposal modal with project pre-filled', () => {
    component.openProposalModal(mockPublishedProject);
    expect(component.showProposalModal()).toBe(true);
    expect(component.selectedProject()?.id).toBe('prj_pub_1');
    expect(component.proposalForm.get('proposedPrice')?.value).toBe(65000);

    component.closeProposalModal();
    expect(component.showProposalModal()).toBe(false);
    expect(component.selectedProject()).toBeNull();
  });

  it('should submit proposal via projectService.submitProposal', () => {
    const submitSpy = vi.spyOn(projectService, 'submitProposal').mockReturnValue(of({
      id: 'prop_new',
      projectId: 'prj_pub_1',
      projectTitle: 'Cloud DevOps Pipeline',
      freelancerId: 'user_prem',
      freelancerName: 'Premkumar',
      freelancerEmail: 'prem@lancenexa.dev',
      proposedPrice: 65000,
      estimatedDelivery: '15 Days',
      coverLetter: 'I have extensive experience deploying AWS and Kubernetes pipelines.',
      status: 'Submitted',
      createdAt: '2026-09-30',
    }));
    const msgSpy = vi.spyOn(messageService, 'add');

    component.openProposalModal(mockPublishedProject);
    component.proposalForm.patchValue({
      proposedPrice: 65000,
      estimatedDelivery: '15 Days',
      coverLetter: 'I have extensive experience deploying AWS and Kubernetes pipelines.',
    });

    component.submitProposal();

    expect(submitSpy).toHaveBeenCalledWith('prj_pub_1', expect.objectContaining({
      proposedPrice: 65000,
      estimatedDelivery: '15 Days',
    }));
    expect(msgSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    expect(component.showProposalModal()).toBe(false);
  });
});
