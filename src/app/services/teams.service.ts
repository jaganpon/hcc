import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TeamsService {
  isInTeams(): boolean {
    return window.parent !== window && !!(window as any).MicrosoftTeams;
  }
}