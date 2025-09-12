import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStep, MatStepper, MatStepperModule } from '@angular/material/stepper';
import { ApiService } from 'src/app/core/api.service';

interface Task {
    id: number;
    name: string;
    status: string; // 'completed' or 'not_started'
}

interface Module {
    id: number;
    name: string;
    description: string;
    tasks: Task[];
}

@Component({
    selector: 'app-onboarding',
    templateUrl: './onboarding.component.html',
    styleUrls: ['./onboarding.component.scss'],
    imports: [MatStepperModule , MatInputModule, MatStep, MatCheckbox, MatStepper, FormsModule, ReactiveFormsModule, CommonModule],
})
export class OnboardingComponent implements OnInit {
    @Input() tempId!: string;
    @Output() onboardingComplete = new EventEmitter<void>();

    modules: Module[] = [];
    stepForms: FormGroup[] = [];
    stepCompletion: boolean[] = [];
    currentStep = 0;

    constructor(private fb: FormBuilder, private api: ApiService) { }

    ngOnInit() {
        if (!this.tempId) return;

        // Fetch user progress and modules/tasks
        this.api.getProgress(this.tempId).subscribe({
            next: (res: any) => {
                this.modules = res.modules || [];

                // Initialize reactive forms per module
                this.stepForms = this.modules.map(module => {
                    const group: any = {};
                    module.tasks.forEach(t => group[t.id] = t.status === 'completed');
                    return this.fb.group(group);
                });

                // Initialize step completion
                this.setStepCompletion();
            },
            error: err => console.error(err)
        });
    }

    // Update stepCompletion based on checkboxes
    setStepCompletion() {
        if (!this.modules || !this.stepForms) return;

        this.stepCompletion = this.modules.map((module, i) => {
            const form = this.stepForms[i];
            if (!form) return false;
            return Object.values(form.value).every(v => v === true);
        });
    }

    // Toggle task checkbox
    onTaskToggle(stepIndex: number, taskId: number) {
        const form = this.stepForms[stepIndex];
        if (!form) return;

        const completed = form.get(taskId.toString())?.value || false;

        // Update backend
        this.api.completeTask(this.tempId, taskId, { completed }).subscribe({
            next: () => {
                this.setStepCompletion();
            },
            error: err => console.error(err)
        });
    }

    // Move to next step if current is complete
    saveStep(stepIndex: number) {
        if (!this.stepCompletion[stepIndex]) return;
        this.currentStep = stepIndex + 1;
    }

    finishOnboarding() {
        if (!this.stepCompletion.every(s => s)) {
            alert('Please complete all tasks before finishing.');
            return;
        }

        this.api.completeOnboarding(this.tempId).subscribe({
            next: () => {
                alert('Onboarding completed!');
                this.onboardingComplete.emit();
            },
            error: err => console.error(err)
        });
    }
    get allStepsCompleted(): boolean {
        if (!this.stepCompletion || !this.stepCompletion.length) return false;
        return this.stepCompletion.every(s => s);
    }

}
