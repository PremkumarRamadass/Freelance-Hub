import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService Role and Individual Account Management', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([{ path: 'login', component: class {} as any }])
      ]
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with Freelancer role by default', () => {
    expect(service.userRole()).toBe('FREELANCER');
    expect(service.isFreelancer()).toBe(true);
    expect(service.isClient()).toBe(false);
    expect(service.isAdmin()).toBe(false);
  });

  it('should register a new CLIENT account and persist client identity', async () => {
    const uniqueEmail = `pooja_${Date.now()}@enterprises.in`;
    const res = await firstValueFrom(service.register({
      name: 'Pooja Enterprises',
      email: uniqueEmail,
      password: 'password123',
      role: 'CLIENT',
      companyName: 'Pooja Global Tech'
    }));

    expect(res.user.role).toBe('CLIENT');
    expect(res.user.companyName).toBe('Pooja Global Tech');
    expect(service.userRole()).toBe('CLIENT');
    expect(service.isClient()).toBe(true);
    expect(service.isFreelancer()).toBe(false);
  });

  it('should register a new ADMIN account and persist admin identity', async () => {
    const uniqueEmail = `chief_${Date.now()}@agency.io`;
    const res = await firstValueFrom(service.register({
      name: 'Agency Leader',
      email: uniqueEmail,
      password: 'password123',
      role: 'ADMIN',
      companyName: 'Apex Creative Studio',
      passcode: 'ADMIN2026'
    }));

    expect(res.user.role).toBe('ADMIN');
    expect(service.userRole()).toBe('ADMIN');
    expect(service.isAdmin()).toBe(true);
    expect(service.isClient()).toBe(false);
  });

  it('should authenticate registered user with matching credentials on login', async () => {
    const uniqueEmail = `dev_${Date.now()}@freelance.org`;
    await firstValueFrom(service.register({
      name: 'Custom Freelancer',
      email: uniqueEmail,
      password: 'mypassword',
      role: 'FREELANCER',
      hourlyRate: 3000
    }));

    service.logout();
    expect(service.currentUser()).toBeNull();

    const loginRes = await firstValueFrom(service.login({
      email: uniqueEmail,
      password: 'mypassword'
    }));

    expect(loginRes.user.role).toBe('FREELANCER');
    expect(loginRes.user.name).toBe('Custom Freelancer');
    expect(service.userRole()).toBe('FREELANCER');
  });
});
