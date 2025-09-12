import { appConfig } from './app/app.config';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { msalConfig } from './app/auth/msal.config';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalService, MsalBroadcastService, MSAL_INSTANCE } from '@azure/msal-angular';

async function bootstrap() {
  // Create MSAL instance
  const msalInstance = new PublicClientApplication(msalConfig);

  // ⚡ Initialize MSAL (important for standalone Angular)
  await msalInstance.initialize();

  // Bootstrap Angular app
  await bootstrapApplication(AppComponent, {
    providers: [
      provideHttpClient(),
      { provide: MSAL_INSTANCE, useValue: msalInstance },
      MsalService,
      MsalBroadcastService,
    ],
  });
}

bootstrap().catch(err => console.error(err));
