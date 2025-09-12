import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ApiService, Joinee } from 'src/app/core/api.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    NgChartsModule
  ]
})
export class AdminComponent implements OnInit {
  joinees: Joinee[] = [];
  displayedColumns: string[] = ['id', 'name', 'email','phone', 'temp_id', 'progress'];

  // Chart.js config
  chartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Completed' },
      { data: [], label: 'Pending' }
    ]
  };

  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    }
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadJoinees();
    this.loadAnalytics();
  }

  loadJoinees() {
    this.api.getJoinees().subscribe((res: any) => {
      this.joinees = res;
    });
  }

  loadAnalytics() {
    this.api.getAnalyticsSummary().subscribe((res: any) => {
      const labels = res.task_stats.map((t: any) => t.name);
      const completed = res.task_stats.map((t: any) => t.completed);
      const pending = res.task_stats.map((t: any) => t.total_attempts - t.completed);

      this.chartData = {
        labels,
        datasets: [
          { data: completed, label: 'Completed' },
          { data: pending, label: 'Pending' }
        ]
      };
    });
  }
}
