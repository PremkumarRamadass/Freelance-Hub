import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole, LoginDto } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  selectedRoleMode = signal<UserRole>('FREELANCER');

  loginForm: FormGroup = this.fb.group({
    email: ['prem@freelancehub.dev', [Validators.required, Validators.email]],
    password: ['freelancer123', [Validators.required, Validators.minLength(6)]]
  });

  selectRoleMode(role: UserRole): void {
    this.selectedRoleMode.set(role);
    if (role === 'CLIENT') {
      this.loginForm.patchValue({
        email: 'rahul@abcpvtltd.com',
        password: 'client123'
      });
    } else if (role === 'ADMIN') {
      this.loginForm.patchValue({
        email: 'admin@freelancehub.dev',
        password: 'admin123'
      });
    } else {
      this.loginForm.patchValue({
        email: 'prem@freelancehub.dev',
        password: 'freelancer123'
      });
    }
  }

  fillCredentials(email: string, pass: string, role: UserRole): void {
    this.selectedRoleMode.set(role);
    this.loginForm.patchValue({ email, password: pass });
    this.onSubmit();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const credentials: LoginDto = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Login failed. Please check credentials.');
      }
    });
  }
}
