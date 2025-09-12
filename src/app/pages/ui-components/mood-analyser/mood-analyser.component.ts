import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { environment } from 'src/environments/environment';

interface ChatResponse {
    reply: string;
    stage: string;
    username: string | null;
}

@Component({
    selector: 'app-mood-analyser',
    standalone: true,
    templateUrl: './mood-analyser.component.html',
    styleUrls: ['./mood-analyser.component.scss'],
    imports: [CommonModule, ReactiveFormsModule, HttpClientModule]
})
export class MoodAnalyserComponent implements OnInit {
    private base = environment.apiBase;
    currentStep = 1;
    moods = [
        { label: 'Happy', icon: '😀', value: 'happy' },
        { label: 'Sad', icon: '😢', value: 'sad' },
        { label: 'Frustrated', icon: '😡', value: 'frustrated' },
        { label: 'Neutral', icon: '😐', value: 'neutral' }
    ];

    heading = '';
    showThanks = false;

    // Create FormControls explicitly
    nameControl = new FormControl('', { nonNullable: true });
    anonymousControl = new FormControl(false, { nonNullable: true });
    feedbackControl = new FormControl('', { nonNullable: true });

    // Group for convenience
    userForm = new FormGroup({
        name: this.nameControl,
        anonymous: this.anonymousControl
    });

    feedbackForm = new FormGroup({
        feedback: this.feedbackControl
    });

    userId!: string;
    sessionId!: string;

    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.userId = uuidv4();
        this.sessionId = uuidv4();
        this.sendInitialApi();
    }

    sendInitialApi() {
        const payload = { user_id: this.userId, session_id: this.sessionId, message: '' };
        this.http.post<ChatResponse>(`${this.base}/mood/chat`, payload)
            .subscribe(res => this.heading = res.reply);
    }

    selectMood(mood: string) {
        const payload = { user_id: this.userId, session_id: this.sessionId, message: mood };
        this.http.post<ChatResponse>(`${this.base}/mood/chat`, payload)
            .subscribe(res => {
                this.heading = res.reply;
                this.currentStep = 2;
            });
    }

    canContinue() {
        return this.anonymousControl.value || this.nameControl.value.trim() !== '';
    }

    continueStep2() {
        if (!this.canContinue()) return;

        const message = this.anonymousControl.value ? 'Anonymous' : this.nameControl.value.trim();
        const payload = { user_id: this.userId, session_id: this.sessionId, message };
        this.http.post<ChatResponse>(`${this.base}/mood/chat`, payload)
            .subscribe(res => {
                this.heading = res.reply;
                this.currentStep = 3;
            });
    }

    submitFeedback() {
        if (this.feedbackControl.invalid) return;

        const payload = {
            user_id: this.userId,
            session_id: this.sessionId,
            message: this.feedbackControl.value
        };

        this.http.post<ChatResponse>(`${this.base}/mood/chat`, payload)
            .subscribe(res => {
                this.heading = res.reply;
                this.showThanks = true;
            });
    }

    resetStepper() {
        this.currentStep = 1;
        this.nameControl.setValue('');
        this.anonymousControl.setValue(false);
        this.feedbackControl.setValue('');
        this.userId = uuidv4();
        this.sessionId = uuidv4();
        this.showThanks = false;
        this.sendInitialApi();
    }
}
