import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from 'src/app/core/api.service';
import { OnboardingComponent } from '../onboarding/onboarding.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    OnboardingComponent
  ]
})
export class LandingComponent {
  name: string = '';
  email: string = '';
  phone: string = '';
  tempId: string = '';

  showOnboarding = false;

  constructor(private api: ApiService) {}

  // New user registration
  register() {
    if (!this.name || !this.email || !this.phone) {
      alert('Please enter name, email, and phone');
      return;
    }

    const payload = {
      name: this.name,
      email: this.email,
      phone: this.phone
    };

    this.api.createUser(payload).subscribe({
      next: (res: any) => {
        console.log('User created:', res);
        this.tempId = res.temp_id;
        this.showOnboarding = true;
      },
      error: (err) => {
        console.error('Error creating user:', err);
        alert('Failed to create user');
      }
    });
  }

  // Continue with existing user temp ID
  continue() {
    if (!this.tempId) {
      alert('Please enter your temporary ID to continue');
      return;
    }
    console.log('Continuing with temp ID:', this.tempId);
    this.api.continueUser(this.tempId).subscribe({
      next: (res: any) => {
        console.log('Continuing user:', res);
        this.showOnboarding = true;
      },
      error: (err) => {
        console.error('Error continuing user:', err);
        alert('Failed to continue onboarding');
      }
    });
  }

  // Callback from onboarding child component
  handleOnboardingComplete() {
    this.showOnboarding = false;
    alert('🎉 Onboarding completed successfully!');
  }
}
