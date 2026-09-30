import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideRouter([{ path: 'dashboard', component: class {} as any }])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize login form with default freelancer demo credentials', () => {
    expect(component).toBeTruthy();
    expect(component.selectedRoleMode()).toBe('FREELANCER');
    expect(component.loginForm.get('email')?.value).toBe('prem@lancenexus.dev');
  });

  it('should switch demo credentials when selectRoleMode is called', () => {
    component.selectRoleMode('CLIENT');
    expect(component.selectedRoleMode()).toBe('CLIENT');
    expect(component.loginForm.get('email')?.value).toBe('rahul@abcpvtltd.com');

    component.selectRoleMode('ADMIN');
    expect(component.selectedRoleMode()).toBe('ADMIN');
    expect(component.loginForm.get('email')?.value).toBe('admin@lancenexus.dev');
  });

  it('should not submit if form is invalid', () => {
    const loginSpy = vi.spyOn(authService, 'login');
    component.loginForm.patchValue({ email: '', password: '' });

    component.onSubmit();

    expect(component.loginForm.invalid).toBe(true);
    expect(loginSpy).not.toHaveBeenCalled();
  });

  it('should navigate to dashboard upon successful login', () => {
    const mockUser = {
      id: '1',
      name: 'Prem',
      email: 'prem@lancenexus.dev',
      role: 'FREELANCER' as const,
      createdAt: '2026-01-01'
    };
    vi.spyOn(authService, 'login').mockReturnValue(of({ user: mockUser, token: 'mock-token' }));
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    expect(component.isLoading()).toBe(false);
  });

  it('should display error message on login failure', () => {
    vi.spyOn(authService, 'login').mockReturnValue(
      throwError(() => new Error('Invalid email or password'))
    );

    component.onSubmit();

    expect(component.errorMessage()).toBe('Invalid email or password');
    expect(component.isLoading()).toBe(false);
  });
});
