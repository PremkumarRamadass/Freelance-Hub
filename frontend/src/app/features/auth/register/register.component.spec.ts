import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';

describe('RegisterComponent 3-Role Decision', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideHttpClient(),
        provideRouter([{ path: 'dashboard', component: class {} as any }])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should default to FREELANCER role on signup', () => {
    expect(component.selectedRole()).toBe('FREELANCER');
  });

  it('should allow user to decide and select CLIENT role', () => {
    component.selectRole('CLIENT');
    expect(component.selectedRole()).toBe('CLIENT');
    expect(component.registerForm.get('title')?.value).toBe('Managing Director');
  });

  it('should allow user to decide and select ADMIN role', () => {
    component.selectRole('ADMIN');
    expect(component.selectedRole()).toBe('ADMIN');
    expect(component.registerForm.get('passcode')?.value).toBe('ADMIN2026');
  });

  it('should prevent registration if passwords do not match', () => {
    component.registerForm.patchValue({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'mismatchPassword',
      agreeTerms: true
    });

    component.onSubmit();
    expect(component.errorMessage()).toContain('Passwords do not match');
  });
});
