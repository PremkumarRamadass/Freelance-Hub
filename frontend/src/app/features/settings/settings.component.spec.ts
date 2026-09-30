import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { SettingsComponent } from './settings.component';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let authService: AuthService;
  let messageService: MessageService;

  const mockUser: User = {
    id: 'user_1',
    name: 'Premkumar',
    email: 'prem@freelancehub.dev',
    role: 'FREELANCER',
    phone: '+91 99999 88888',
    location: 'Chennai, India',
    createdAt: '2026-01-01'
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    messageService = TestBed.inject(MessageService);

    (authService as any)._currentUser.set(mockUser);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize and populate profile form with current user data', () => {
    expect(component).toBeTruthy();
    expect(component.profileForm.get('name')?.value).toBe('Premkumar');
    expect(component.profileForm.get('email')?.value).toBe('prem@freelancehub.dev');
    expect(component.profileForm.get('phone')?.value).toBe('+91 99999 88888');
  });

  it('should switch active tabs in settings', () => {
    expect(component.activeTab()).toBe('profile');
    component.activeTab.set('password');
    expect(component.activeTab()).toBe('password');
  });

  it('should update profile via authService.updateProfile', () => {
    const updateSpy = vi.spyOn(authService, 'updateProfile').mockReturnValue(of(mockUser));
    const msgSpy = vi.spyOn(messageService, 'add');

    component.profileForm.patchValue({
      name: 'Prem Updated',
      email: 'prem.updated@freelancehub.dev'
    });

    component.updateProfile();

    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Prem Updated',
      email: 'prem.updated@freelancehub.dev'
    }));
    expect(msgSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });
});
