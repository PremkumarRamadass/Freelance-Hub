import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError, catchError } from 'rxjs';
import { User, AuthResponse, LoginDto, RegisterDto, UpdateProfileDto, ChangePasswordDto, PasswordChangeResult } from '../models/user.model';
import { API_BASE_URL } from '../config/api.config';

const TOKEN_KEY = 'fh_auth_token';
const USER_KEY = 'fh_auth_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly _currentUser = signal<User | null>(this.getStoredUser());
  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser() && !!this._token());
  readonly userRole = computed(() => this._currentUser()?.role || 'FREELANCER');
  readonly isAdmin = computed(() => this.userRole() === 'ADMIN');
  readonly isFreelancer = computed(() => this.userRole() === 'FREELANCER');
  readonly isClient = computed(() => this.userRole() === 'CLIENT');

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  login(credentials: LoginDto): Observable<AuthResponse> {
    if (!credentials.email || !credentials.password) {
      return throwError(() => new Error('Please enter both email and password'));
    }

    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, credentials).pipe(
      tap((res: AuthResponse) => {
        this.setSession(res.token, res.user);
      }),
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message
          ? (Array.isArray(err.error.message) ? err.error.message.join(', ') : err.error.message)
          : (err.message || 'Login failed. Please verify your credentials.');
        return throwError(() => new Error(msg));
      })
    );
  }

  register(data: RegisterDto): Observable<AuthResponse> {
    const payload: RegisterDto = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      companyName: data.companyName,
      title: data.title,
      hourlyRate: data.hourlyRate,
      phone: data.phone,
      passcode: data.passcode
    };

    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/register`, payload).pipe(
      tap((res: AuthResponse) => {
        this.setSession(res.token, res.user);
      }),
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message
          ? (Array.isArray(err.error.message) ? err.error.message.join(', ') : err.error.message)
          : (err.message || 'Registration failed. Please check your information.');
        return throwError(() => new Error(msg));
      })
    );
  }

  updateProfile(profileData: UpdateProfileDto): Observable<User> {
    const user = this._currentUser();
    if (!user) return throwError(() => new Error('Not authenticated'));

    return this.http.put<User>(`${API_BASE_URL}/auth/profile/${user.id}`, profileData).pipe(
      tap((updated: User) => {
        const fullUser: User = { ...user, ...updated };
        this.setSession(this._token() || 'fh_token', fullUser);
      }),
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message || err.message || 'Failed to update profile.';
        return throwError(() => new Error(msg));
      })
    );
  }

  changePassword(dto: ChangePasswordDto): Observable<PasswordChangeResult> {
    const user = this._currentUser();
    if (!user) return throwError(() => new Error('Not authenticated'));

    return this.http.put<PasswordChangeResult>(
      `${API_BASE_URL}/auth/change-password/${user.id}`,
      dto
    ).pipe(
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message || err.message || 'Failed to change password.';
        return throwError(() => new Error(msg));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
    this._token.set(null);
    this.router.navigate(['/login']);
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._token.set(token);
    this._currentUser.set(user);
  }
}
