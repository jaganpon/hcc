import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { DocListComponent } from '../doc-list/doc-list.component';
import { UploadComponent } from '../upload/upload.component';
import { FAQComponent } from "../faq/faq.component";
import { MoodListComponent } from '../mood-list/mood-list.component';
import { AdminComponent } from '../admin/admin.component';

@Component({
  selector: 'hr-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTab,
    MatTabGroup,
    HttpClientModule,
    UploadComponent,
    DocListComponent,
    FAQComponent,
    MoodListComponent,
    AdminComponent
],
  templateUrl: './hrpanel.html',
  styleUrl: './hrpanel.css',
})
export class HRPanelComponent {

  constructor() { }

  
}
