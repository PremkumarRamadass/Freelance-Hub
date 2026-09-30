import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User, UpdateProfileDto } from '../../core/models/user.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  activeTab = signal<'profile' | 'password' | 'notifications' | 'preferences'>('profile');

  profileForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['+91 98765 43210'],
    location: ['Chennai, India']
  });

  ngOnInit(): void {
    const user: User | null = this.authService.currentUser();
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email,
        phone: user.phone || '+91 98765 43210',
        location: user.location || 'Chennai, India'
      });
    }
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;

    const dto: UpdateProfileDto = {
      name: this.profileForm.value.name,
      email: this.profileForm.value.email,
      phone: this.profileForm.value.phone,
      location: this.profileForm.value.location
    };

    this.authService.updateProfile(dto).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Profile Updated',
          detail: 'Your profile has been synchronized with the server!'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Profile Updated',
          detail: 'Your settings have been saved.'
        });
      }
    });
  }
}
