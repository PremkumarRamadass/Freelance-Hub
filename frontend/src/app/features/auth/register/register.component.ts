import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole, RegisterDto } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  selectedRole = signal<UserRole>('FREELANCER');

  registerForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    companyName: [''],
    title: ['Full Stack Developer'],
    hourlyRate: [2500],
    phone: [''],
    passcode: ['ADMIN2026'],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
    agreeTerms: [true, Validators.requiredTrue]
  });

  selectRole(role: UserRole): void {
    this.selectedRole.set(role);
    this.errorMessage.set('');

    if (role === 'CLIENT') {
      this.registerForm.patchValue({
        title: 'Managing Director',
        companyName: ''
      });
    } else if (role === 'ADMIN') {
      this.registerForm.patchValue({
        title: 'Operations Director',
        companyName: 'Apex Agency',
        passcode: 'ADMIN2026'
      });
    } else {
      this.registerForm.patchValue({
        title: 'Full Stack Developer',
        hourlyRate: 2500
      });
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const val = this.registerForm.value;
    this.errorMessage.set('');

    if (val.password !== val.confirmPassword) {
      this.errorMessage.set('Passwords do not match. Please re-enter.');
      return;
    }

    if (this.selectedRole() === 'ADMIN' && val.passcode !== 'ADMIN2026') {
      this.errorMessage.set('Invalid Agency Passcode. Please use ADMIN2026 for demo agency onboarding.');
      return;
    }

    this.isLoading.set(true);
    const role: UserRole = this.selectedRole();

    let computedTitle = val.title || 'Independent Consultant';
    if (role === 'CLIENT') {
      computedTitle = val.companyName ? `Managing Director, ${val.companyName}` : 'Client Representative';
    } else if (role === 'ADMIN') {
      computedTitle = val.companyName ? `Operations Director, ${val.companyName}` : 'Agency Administrator';
    }

    const payload: RegisterDto = {
      name: val.name,
      email: val.email,
      password: val.password,
      role,
      companyName: val.companyName,
      title: computedTitle,
      hourlyRate: role === 'FREELANCER' ? Number(val.hourlyRate) : undefined,
      phone: val.phone,
      passcode: val.passcode
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Registration failed. Please try again.');
      }
    });
  }
}
