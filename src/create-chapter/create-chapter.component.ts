import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCard} from '@angular/material/card';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {NgIf} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {maxValue, minValue, noWhitespaceValidator} from '../validators/custom-validators';
import {ChapterService} from '../services/chapter.service';
import {MatButton} from '@angular/material/button';
import {catchError, timeout} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {NotificationService} from '../services/notification.service';

@Component({
	selector: 'app-create-chapter',
	standalone: true,
	imports: [
		FormsModule,
		MatCard,
		MatError,
		MatFormField,
		MatInput,
		MatLabel,
		NgIf,
		ReactiveFormsModule,
		MatButton
	],
	templateUrl: './create-chapter.component.html',
})
export class CreateChapterComponent implements OnInit {
	chapterForm: FormGroup;

	constructor(
		private route: ActivatedRoute,
		private chapterService: ChapterService,
		private fb: FormBuilder,
		private router: Router,
		private notificationService: NotificationService
	) {
		this.chapterForm = this.fb.group({
			name: ['', [Validators.required, Validators.minLength(1), noWhitespaceValidator]],
			marinesCount: ['', [Validators.required, Validators.pattern(/^-?\d+$/), minValue(1), maxValue(1000), noWhitespaceValidator]],
			world: ['',],
		});
	}

	ngOnInit(): void {
	}

	onSubmit() {
		this.trimFormValues(this.chapterForm);
		const formData = this.chapterForm.value;

		if (this.chapterForm.valid) {
			this.chapterService.add(formData).pipe(
				timeout(3000),
				catchError(error => {
					if (error.name === 'TimeoutError') {
						this.notificationService.error('Сервер не отвечает. Превышено время ожидания.', 'Ошибка входа:');
					} else if (error.status === 0) {
						this.notificationService.error('Сервер недоступен', 'Ошибка входа:');
					} else if (error.status === 409) {
						this.notificationService.error('Пожалуйста, выберите другое имя', 'Орден с таким именем уже существует.')
					} else {
						this.notificationService.error(error.message || 'Неизвестная ошибка',);
					}
					return throwError(() => error);
				})
			).subscribe(
				(response: any) => {
					this.notificationService.success(response.msg);
					this.router.navigate(['/']);
				},
				error => {
					console.error(error);
				}
			);
		} else {
			this.notificationService.error('Форма содержит ошибки!', 'Ошибка');
		}
	}


	private trimFormValues(formGroup: FormGroup): void {
		Object.keys(formGroup.controls).forEach(key => {
			const control = formGroup.get(key);
			if (control instanceof FormGroup) {
				this.trimFormValues(control);
			} else if (typeof control?.value === 'string') {
				control.setValue(control.value.trim());
			}
		});
	}

}
