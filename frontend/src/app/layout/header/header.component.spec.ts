import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../core/services/auth.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([{ path: 'login', component: class {} as any }]),
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create header component', () => {
    expect(component).toBeTruthy();
    expect(component.showUserMenu()).toBe(false);
  });

  it('should toggle user menu state', () => {
    component.showUserMenu.set(true);
    expect(component.showUserMenu()).toBe(true);
  });

  it('should invoke auth logout and reset menu on logout()', () => {
    const logoutSpy = vi.spyOn(authService, 'logout');
    component.showUserMenu.set(true);

    component.logout();

    expect(component.showUserMenu()).toBe(false);
    expect(logoutSpy).toHaveBeenCalled();
  });
});
