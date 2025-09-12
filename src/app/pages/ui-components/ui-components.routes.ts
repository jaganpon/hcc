import { Routes } from '@angular/router';

// ui
import { AppBadgeComponent } from './badge/badge.component';
import { AppChipsComponent } from './chips/chips.component';
import { AppListsComponent } from './lists/lists.component';
import { AppMenuComponent } from './menu/menu.component';
import { AppTooltipsComponent } from './tooltips/tooltips.component';
import { AppFormsComponent } from './forms/forms.component';
import { AppTablesComponent } from './tables/tables.component';
import { UploadComponent } from './upload/upload.component';
import { PerformanceComponent } from './performance/performance.component';
import { GoalsComponent } from './goals/goals.component';
import { EmployeesComponent } from './employee/employees.component';
import { ExitFormComponent } from './exit-formalities/exitForm.component';
import { HRPanelComponent } from './hr-panel/hrpanel.component';
import { LandingComponent } from './landing/landing.component';
import { MoodAnalyserComponent } from './mood-analyser/mood-analyser.component';

export const UiComponentsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'virtual-onboarding',
        pathMatch: 'full',
      },
      {
        path: 'hr-panel',
        component: HRPanelComponent,
      },
      {
        path: 'virtual-onboarding',
        component: LandingComponent,
      },
      {
        path: 'mood-analyser',
        component: MoodAnalyserComponent,
      },
      {
        path: 'chat',
        component: UploadComponent,
      },
      {
        path: 'performance',
        component: PerformanceComponent,
      },
      {
        path: 'goals',
        component: GoalsComponent,
      },
      {
        path: 'employee',
        component: EmployeesComponent,
      },
      {
        path: 'exit-formalities',
        component: ExitFormComponent,
      },
      
      {
        path: 'badge',
        component: AppBadgeComponent,
      },
      {
        path: 'chips',
        component: AppChipsComponent,
      },
      {
        path: 'lists',
        component: AppListsComponent,
      },
      {
        path: 'menu',
        component: AppMenuComponent,
      },
      {
        path: 'tooltips',
        component: AppTooltipsComponent,
      },
      {
        path: 'forms',
        component: AppFormsComponent,
      },
      {
        path: 'tables',
        component: AppTablesComponent,
      },
    ],
  },
];
