import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDatepickerModule, MatDateRangeInput, MatDateRangePicker } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { environment } from 'src/environments/environment';
import { MoodGraphComponent } from '../mood-graph/mood-graph.component';


export interface PeriodicElement {
    id: number;
    username: string;
    mood: string;
    reason: string;
    date: string;
}

const ELEMENT_DATA: PeriodicElement[] = [];
/**
* @title expand table 
*/
@Component({
    selector: 'mood-list',
    imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatDividerModule,
        MatCheckboxModule,
        MatSortModule,
        MatIconModule,
        MatButtonModule,
        MatPaginator,
        MatToolbarModule,
        MatDateRangePicker,
        MatSelectModule,
        MatDateRangeInput,
        MatInputModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatInputModule,
        MatNativeDateModule,
        FormsModule,
        MoodGraphComponent
    ],
    templateUrl: './mood-list.html',
    styleUrls: ['./mood-list.css'],
})
export class MoodListComponent implements OnInit, AfterViewInit {
    private base = environment.apiBase;
    statusMessage: string | null = null;

    displayedColumns: string[] = ['id', 'username', 'mood', 'reason', 'date'];
    dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
    selection = new SelectionModel<PeriodicElement>(true, []);
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    dateRange: { start: Date | null; end: Date | null } = { start: null, end: null };
    groupBy: 'hour' | 'day' | 'month' | 'year' = 'day';

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.getDocuments();
    }

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    }

    getDocuments() {
        this.http.get<any[]>(`${this.base}/mood/logs`).subscribe({
            next: (data) => {
                console.log(data);
                this.dataSource.data = data;
            },
            error: (err) => {
                console.error('Error fetching Mood list:', err);
            }
        });

    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    onSearch() {
        // Build query params dynamically
        const params: any = {
            group_by: this.groupBy
        };

        if (this.dateRange.start) {
            params.date_from = this.formatDateLocal(this.dateRange.start);
        }

        if (this.dateRange.end) {
            params.date_to = this.formatDateLocal(this.dateRange.end);
        }

        console.log('Sending params to backend:', params);

        // Analytics call
        this.http.get(`${this.base}/mood/analytics`, { params }).subscribe({
            next: (res) => {
                console.log('Analytics result:', res);
                // TODO: update chart/table
            },
            error: (err) => {
                console.error('Failed to fetch analytics', err);
            }
        });

        // Logs call
        const logsParams: any = {};
        if (this.dateRange.start) logsParams.date_from = this.formatDateLocal(this.dateRange.start);
        if (this.dateRange.end) logsParams.date_to = this.formatDateLocal(this.dateRange.end);

        this.http.get(`${this.base}/mood/logs`, { params: logsParams }).subscribe({
            next: (res) => {
                console.log('Logs result:', res);
                // TODO: update table
            },
            error: (err) => {
                console.error('Failed to fetch logs', err);
            }
        });
    }


    formatDateLocal(date: Date): string {
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0'); // months are 0-based
        const d = date.getDate().toString().padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    triggerMoodMetrics() {
        this.statusMessage = "Sending Teams notifications...";

        this.http.post("/api/trigger-mood", {}).subscribe({
            next: (res: any) => {
                this.statusMessage = res.message || "Notifications sent successfully!";
            },
            error: (err) => {
                console.error(err);
                this.statusMessage = "Failed to send notifications. Check console.";
            }
        });
    }


}
