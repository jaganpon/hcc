import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ChartType } from 'ng-apexcharts';
import {
    ChartComponent,
    ApexChart,
    ApexNonAxisChartSeries,
    ApexResponsive,
    ApexLegend,
    ApexDataLabels,
    ApexXAxis,
    ApexYAxis,
    ApexStroke,
    NgApexchartsModule,
} from 'ng-apexcharts';

type PieChart = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels: string[];
    responsive: ApexResponsive[];
    legend: ApexLegend;
    dataLabels: ApexDataLabels;
    colors: string[];
};

type ColumnChart = {
    series: { name: string; data: number[] }[];
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    dataLabels: ApexDataLabels;
    stroke: ApexStroke;
};

@Component({
    selector: 'app-mood-graph',
    standalone: true,
    imports: [CommonModule, MatCardModule, NgApexchartsModule],
    templateUrl: './mood-graph.component.html',
    styleUrls: ['./mood-graph.component.scss'],
})
export class MoodGraphComponent implements OnInit, AfterViewInit {
    @ViewChild('dayChart') dayChart!: ChartComponent;
    @ViewChild('topMoodChart') topMoodChart!: ChartComponent;
    dayPieChart!: PieChart;
    topMoodPieChart!: PieChart;
    rangeColumnChart!: ColumnChart;

    moodColors: { [key: string]: string } = {
        Happy: '#00C49F',
        Sad: '#FF8042',
        Frustrated: '#FF0000',
        Neutral: '#8884d8',
        unknown: '#CCCCCC',
    };

    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.loadCharts();
    }
    ngAfterViewInit() {
        // Wait for view to render
        setTimeout(() => {
            this.dayChart?.updateOptions({}, true, true);
            this.topMoodChart?.updateOptions({}, true, true);
        });
    }

    loadCharts() {
        this.http.get<any>('http://localhost:8000/v1/mood/analytics?group_by=day')
            .subscribe({
                next: (res) => {
                    // ---- Prepare buckets safely ----
                    const buckets = res.buckets || {};
                    const bucketKeys = Object.keys(buckets);
                    const firstBucket = bucketKeys.length ? buckets[bucketKeys[0]] : {};

                    // ---- Day Pie Chart ----
                    const dayLabels = Object.keys(firstBucket).length ? Object.keys(firstBucket) : ['No data'];
                    const daySeries = Object.values(firstBucket).map(v => Number(v) || 0);
                    this.dayPieChart = {
                        series: daySeries.length ? (daySeries as ApexNonAxisChartSeries) : [0],
                        chart: { width: 380, type: 'donut' },
                        labels: dayLabels,
                        responsive: [{ breakpoint: 480, options: { chart: { width: 300 }, legend: { position: 'bottom' } } }],
                        legend: { position: 'bottom' },
                        dataLabels: { enabled: true } as ApexDataLabels,
                        colors: dayLabels.map(k => this.moodColors[k] || '#999999'),
                    };

                    // ---- Top Mood Pie Chart ----
                    const topMoodData = res.top_moods || {};
                    const topLabels = Object.keys(topMoodData).length ? Object.keys(topMoodData) : ['No data'];
                    const topSeries = Object.values(topMoodData).map(v => Number(v) || 0);
                    this.topMoodPieChart = {
                        series: topSeries.length ? (topSeries as ApexNonAxisChartSeries) : [0],
                        chart: { width: 380, type: 'pie' },
                        labels: topLabels,
                        responsive: [{ breakpoint: 480, options: { chart: { width: 300 }, legend: { position: 'bottom' } } }],
                        legend: { position: 'bottom' },
                        dataLabels: { enabled: true } as ApexDataLabels,
                        colors: topLabels.map(k => this.moodColors[k] || '#999999'),
                    };

                    // // ---- Range Column Chart ----
                    // const moods = Object.keys(firstBucket).length ? Object.keys(firstBucket) : ['No data'];
                    // const columnSeries = moods.map(mood => ({
                    //     name: mood,
                    //     data: bucketKeys.length
                    //         ? bucketKeys.map(date => Number(buckets[date]?.[mood] || 0))
                    //         : [0]
                    // }));

                    // this.rangeColumnChart = {
                    //     series: columnSeries.length ? columnSeries : [{ name: 'No data', data: [0] }],
                    //     chart: { type: 'bar', height: 350 },
                    //     xaxis: { categories: bucketKeys.length ? bucketKeys : ['No data'] },
                    //     yaxis: { title: { text: 'Count' } },
                    //     dataLabels: { enabled: true } as ApexDataLabels,
                    //     stroke: { show: true, width: 1, colors: ['#fff'] } as ApexStroke,
                    // };
                },
                error: (err) => {
                    console.error('Error loading charts:', err);
                    // Fully safe fallback
                    const fallbackPie: PieChart = {
                        series: [0],
                        chart: { width: 380, type: 'pie' as ChartType },
                        labels: ['No data'],
                        responsive: [
                            {
                                breakpoint: 480,
                                options: { chart: { width: 300 }, legend: { position: 'bottom' as const } },
                            },
                        ],
                        legend: { position: 'right' as const },
                        dataLabels: { enabled: true } as ApexDataLabels,
                        colors: ['#999999'],
                    };
                    this.dayPieChart = { ...fallbackPie };
                    this.topMoodPieChart = { ...fallbackPie };
                    this.rangeColumnChart = {
                        series: [{ name: 'No data', data: [0] }],
                        chart: { type: 'bar', height: 350 },
                        xaxis: { categories: ['No data'] },
                        yaxis: { title: { text: 'Count' } },
                        dataLabels: { enabled: true } as ApexDataLabels,
                        stroke: { show: true, width: 1, colors: ['#fff'] } as ApexStroke,
                    };
                }
            });
    }


}
