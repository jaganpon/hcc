import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Joinee {
  id: number;
  name: string;
  email: string;
  temp_id: string;
  progress: {
    total_tasks: number;
    completed_tasks: number;
    remaining_tasks: number;
    completion_percent: number;
    completed_task_details: { id: number; name: string }[];
    pending_task_details?: { id: number; name: string }[]; // 🔹 we’ll extend backend to send this
    onboarding_completed?: number;
  };
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBase;

  constructor(private http: HttpClient) { }

  // 🔹 User APIs
  createUser(payload: any) {
    return this.http.post(`${this.base}/users/new`, payload);
  }

  continueUser(tempId: string) {
    return this.http.post(`${this.base}/users/continue?temp_id=${tempId}`, {});
  }

  getProgress(tempId: string) {
    return this.http.get(`${this.base}/users/${tempId}/progress`);
  }

  completeTask(tempId: string, taskId: number, data?: any) {
    return this.http.post(
      `${this.base}/users/${tempId}/tasks/${taskId}/complete`,
      data || {}
    );
  }

  completeOnboarding(tempId: string) {
    return this.http.post(`${this.base}/users/complete?temp_id=${tempId}`, {});
  }

  getModules() {
    return this.http.get(`${this.base}/public/modules`);
  }

  getTasks(moduleId?: number) {
    return this.http.get(
      `${this.base}/public/tasks${moduleId ? '?module_id=' + moduleId : ''}`
    );
  }

  // 🔹 Onboarding-specific APIs
  updateBankDetails(payload: { bank_name: string; account_number: string }) {
    return this.http.put(`${this.base}/onboarding/bank-details`, payload);
  }

  uploadIdProof(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put(`${this.base}/onboarding/id-proof`, formData);
  }

  updateTeamRole(payload: { manager_name: string; team_name: string; role_name: string }) {
    return this.http.put(`${this.base}/onboarding/team-role`, payload);
  }

  // 🔹 Admin APIs
  getJoinees() {
    return this.http.get(`${this.base}/admin/joinees`);
  }

  getAnalyticsSummary() {
    return this.http.get(`${this.base}/admin/analytics/summary`);
  }
}
