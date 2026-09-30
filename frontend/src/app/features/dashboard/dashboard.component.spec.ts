import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardService: DashboardService;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    dashboardService = TestBed.inject(DashboardService);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize and trigger fetchStats on ngOnInit', () => {
    const fetchSpy = vi.spyOn(dashboardService, 'fetchStats');
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('should provide default taskStats when no stats loaded', () => {
    fixture.detectChanges();
    expect(component.taskStats()).toBeDefined();
    expect(typeof component.taskStats().total).toBe('number');
  });

  it('should scope displayedProjects when user is a client', () => {
    (authService as any)._currentUser.set({
      id: 'c1',
      name: 'Client User',
      email: 'client@example.com',
      role: 'CLIENT',
      createdAt: '2026-01-01'
    });
    fixture.detectChanges();

    expect(authService.isClient()).toBe(true);
    expect(component.displayedProjects().length).toBeLessThanOrEqual(1);
  });
});
