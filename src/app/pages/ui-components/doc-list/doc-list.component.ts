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
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';


export interface PeriodicElement {
    filename: string;
    id: number;
    created_at: number;
}

const ELEMENT_DATA: PeriodicElement[] = [];
/**
* @title expand table 
*/
@Component({
    selector: 'doc-list',
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
    templateUrl: './doc-list.html',
    styleUrls: ['./doc-list.css'],
})
export class DocListComponent implements OnInit, AfterViewInit {
    private base = environment.apiBase;
    
    displayedColumns: string[] = ['select', 'id', 'filename', 'created_at', 'actions'];
    dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
    selection = new SelectionModel<PeriodicElement>(true, []);
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(private http: HttpClient, public snackBar: MatSnackBar) { }

    ngOnInit(): void {
        this.getDocuments();
    }

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    }

    getDocuments() {
        this.http.get<any[]>(`${this.base}/onboarding/files`).subscribe({
            next: (data) => {
                console.log(data);
                this.dataSource.data = data;
            },
            error: (err) => {
                console.error('Error fetching documents:', err);
            }
        });

    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.data.forEach(row => this.selection.select(row));
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    deleteRow(element: any) {
        console.log("Deleting single row:", element);

        // Call backend API with the file id
        this.http.delete(`${this.base}/onboarding/files/delete?file_ids=${element.id}`)
            .subscribe({
                next: (res: any) => {
                    console.log("API delete response:", res);
                    this.snackBar.open(element.filename, 'Deleted', {
                        duration: 2000,
                    });
                    this.selection.clear();
                    // Remove row from datasource only after API succeeds
                    this.dataSource.data = this.dataSource.data.filter(r => r.id !== element.id);
                    this.getDocuments()
                },
                error: (err) => {
                    console.error("Error deleting file:", err);
                }
            });
    }

    deleteSelected() {
        // console.log("Selected rows for deletion:", this.selection.selected, element);
        const selectedRows = this.selection.selected;
        if (selectedRows.length === 0) return;

        // Collect the IDs (adjust if your backend expects "id" instead of "position")
        const ids = selectedRows.map(row => row.id);

        // Build query params like: file_ids=1&file_ids=2&file_ids=3
        const params = ids.map(id => `file_ids=${id}`).join('&');

        this.http.delete(`${this.base}/onboarding/files/delete?${params}`)
            .subscribe({
                next: (res: any) => {
                    console.log("API delete response:", res);
                    this.snackBar.open('All selected documents', 'Deleted', {
                        duration: 2000,
                    });
                    // Update frontend after backend confirms
                    this.dataSource.data = this.dataSource.data.filter(
                        row => !ids.includes(row.id)
                    );

                    // Clear selection
                    this.selection.clear();
                },
                error: (err) => {
                    console.error("Error deleting files:", err);
                }
            });
    }


}
