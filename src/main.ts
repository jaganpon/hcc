import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

import { msalConfig } from './app/auth/msal.config';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalService, MsalBroadcastService, MSAL_INSTANCE } from '@azure/msal-angular';

// Tabler Icons
import { TablerIconsModule } from 'angular-tabler-icons';
import { IconHome, IconUser, IconSettings, IconBell } from 'angular-tabler-icons/icons';
import { provideAnimations } from '@angular/platform-browser/animations';

async function bootstrap() {
  const msalInstance = new PublicClientApplication(msalConfig);
  await msalInstance.initialize();

  await bootstrapApplication(AppComponent, {
    providers: [
      provideHttpClient(),
      provideRouter(routes),
      { provide: MSAL_INSTANCE, useValue: msalInstance },
      MsalService,
      MsalBroadcastService,

      // ✅ Import TablerIconsModule using importProvidersFrom
      importProvidersFrom(
        TablerIconsModule.pick({
          IconHome,
          IconUser,
          IconSettings,
          IconBell
        })
      ),
      provideAnimations(),
    ]
  });
}

bootstrap().catch(err => console.error(err));
