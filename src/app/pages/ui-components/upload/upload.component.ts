import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'upload-doc',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './upload.html',
  styleUrl: './upload.css',
})
export class UploadComponent {
  private base = environment.apiBase;
  
  question = '';
  answer = '';
  uploading = false;
  selectedFiles: File[] = [];
  selectedFile: File | null = null;
  uploadProgress: number = -1;

  constructor(private http: HttpClient,  public snackBar: MatSnackBar) { }

  onFileSelected(event: any) {
    console.log(event, ' @@@@event');
    console.log(event.target, 'files');
    this.selectedFiles = Array.from(event.target.files);
    this.selectedFile = event.target.files[0] ?? null;
  }     

  onUpload() {
    if (!this.selectedFile) return;

    // Example: simulate upload progress
    this.uploadProgress = 0;
    const interval = setInterval(() => {
      this.uploadProgress += 20;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => (this.uploadProgress = -1), 1500);
      }
    }, 300);
  }

  uploadFiles() {
    console.log('Upload files clicked');
    if (this.selectedFiles.length === 0) return;

    const formData = new FormData();
    this.selectedFiles.forEach((file) => formData.append('files', file));

    this.uploading = true;
    this.uploadProgress = 0;

    this.http.post(`${this.base}/onboarding/files/upload`, formData, {
      reportProgress: true,
      observe: 'events',
    }).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          // calculate percentage
          this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
         this.snackBar.open('File uploaded','successfully!', {
                        duration: 2000,
                    });
          this.uploading = false;
          this.uploadProgress = 0;

          // ✅ Clear selection after success
          this.selectedFiles = [];
        }
      },
      error: () => {
        alert('Upload failed');
        this.uploading = false;
      }
    });
  }
}
