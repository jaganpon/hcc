import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { loginRequest } from './auth/msal.config';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  userName: string | null = null;

  constructor(private msal: MsalService) { }

  login() {
    this.msal.loginPopup(loginRequest).subscribe({
      next: (res) => {
        this.userName = res.account?.username || null;
        console.log("Login success:", res);
      },
      error: (err) => console.error(err),
    });
  }

  logout() {
    this.msal.logoutPopup().subscribe({
      next: (res) => {
        this.userName = null;
        console.log("Logout success:", res);
      },
      error: (err) => console.error(err),
    });
  }
}
