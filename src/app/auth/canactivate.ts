import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

export const hrGuard: CanActivateFn = (route, state) => {
  const msal = inject(MsalService);
  const account = msal.instance.getAllAccounts()[0];
  if (account && account.username.indexOf('ponnusamy') > -1) {
    return true;
  }
  alert('Access denied: HR only');
  return false;
};
