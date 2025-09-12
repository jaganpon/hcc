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
import { environment } from 'src/environments/environment';


export interface PeriodicElement {
    question: string;
    count: number;
}

const ELEMENT_DATA: PeriodicElement[] = [];
/**
* @title expand table 
*/
@Component({
    selector: 'faq-list',
    imports: [
        MatTableModule,
        MatCardModule,
        MatFormFieldModule,
        CommonModule,
        MatInputModule,
        MatDividerModule,
        MatCheckboxModule,
        MatSortModule,
        MatIconModule,
        MatButtonModule,
        MatPaginator
    ],
    templateUrl: './faq.html',
    styleUrls: ['./faq.css'],
})
export class FAQComponent implements OnInit, AfterViewInit {
    private base = environment.apiBase;
    
    displayedColumns: string[] = [ 'question', 'count'];
    dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
    selection = new SelectionModel<PeriodicElement>(true, []);
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.getDocuments();
    }

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    }

    getDocuments() {
        this.http.get<any[]>(`${this.base}/onboarding/faqs/top`).subscribe({
            next: (data) => {
                console.log(data);
                this.dataSource.data = data;
            },
            error: (err) => {
                console.error('Error fetching documents:', err);
            }
        });

    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

}
