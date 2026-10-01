import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../../core/services/auth.service';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create sidebar component', () => {
    expect(component).toBeTruthy();
    expect(component.isCollapsed()).toBe(false);
  });

  it('should toggle collapse state', () => {
    component.toggleCollapse();
    expect(component.isCollapsed()).toBe(true);
    component.toggleCollapse();
    expect(component.isCollapsed()).toBe(false);
  });

  it('should compute freelancer navigation items by default', () => {
    const items = component.navItems();
    const labels = items.map(i => i.label);
    expect(labels).toContain('Clients');
    expect(labels).toContain('Payments');
    expect(labels).toContain('Reports');
    expect(labels).toContain('AI Assistant & Chat');
  });

  it('should compute client navigation items when current user is client', () => {
    (authService as any)._currentUser.set({
      id: 'c1',
      name: 'Client User',
      email: 'client@company.com',
      role: 'CLIENT',
      createdAt: '2026-01-01'
    });
    fixture.detectChanges();

    const items = component.navItems();
    const labels = items.map(i => i.label);
    expect(labels).toContain('My Projects');
    expect(labels).toContain('AI Assistant & Chat');
    expect(labels).not.toContain('Clients');
    expect(labels).not.toContain('Payments');
  });
});
