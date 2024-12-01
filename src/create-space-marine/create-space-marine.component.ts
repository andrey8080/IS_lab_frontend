import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ToastrService} from 'ngx-toastr';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatOptionModule} from '@angular/material/core';
import {MatCardModule} from '@angular/material/card';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {SpaceMarineService} from '../services/space-marine.service';
import {catchError, timeout} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {Router} from '@angular/router';
import {maxValue, minValue, validateNumber} from '../validators/custom-validators';
import {ChapterService} from '../services/chapter.service';
import {NotificationService} from '../services/notification.service';


@Component({
	selector: 'app-create-space-marine',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatOptionModule,
		MatCardModule,
		MatSelectModule,
		MatButtonModule
	],
	templateUrl: './create-space-marine.component.html',
	styleUrls: ['./create-space-marine.component.css'],
})
export class CreateSpaceMarineComponent implements OnInit {
	spaceMarineForm: FormGroup;

	chapters: any[] = [];
	categories: { [key: string]: string } = {
		'SCOUT': 'Скаут',
		'AGGRESSOR': 'Агрессор',
		'INCEPTOR': 'Инцептор',
		'SUPPRESSOR': 'Супрессор',
		'TERMINATOR': 'Терминатор'
	};
	weapons: { [key: string]: string } = {
		'HEAVY_BOLTGUN': 'Тяжёлый болтовой пистолет',
		'BOLT_PISTOL': 'Болтовой пистолет',
		'BOLT_RIFLE': 'Болтовая винтовка',
		'COMBI_FLAMER': 'Комби огнемёт',
		'GRAVY_GUN': 'Гравипушка'
	};
	translatedCategories = Object.values(this.categories);
	translatedWeapons = Object.values(this.weapons);


	constructor(private spaceMarineService: SpaceMarineService, private chapterService: ChapterService, private fb: FormBuilder, private notificationService: NotificationService, private router: Router,) {
		this.spaceMarineForm = this.fb.group({
			name: ['1', [Validators.required]],
			coordinates: this.fb.group({
				x: ['1', [Validators.required, Validators.pattern(/^-?\d+$/), minValue(-585)]],
				y: ['1', [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,15})?$/), maxValue(118)]],
			}),
			health: ['1', [Validators.required, Validators.pattern(/^-?\d+$/), minValue(0)]],
			height: ['1', [Validators.pattern(/^-?\d+(\.\d{1,15})?$/), minValue(0)]],
			category: [this.categories[0], [Validators.required]],
			weaponType: [this.weapons[0], [Validators.required]],
			chapter: this.fb.group({
				id: [''],
				name: ['', [Validators.required]],
				marinesCount: ['', [Validators.required]],
				world: [''],
			}),
		});
	}

	ngOnInit(): void {
		this.loadChapters();
	}

	private loadChapters() {
		this.chapterService.getChapters().subscribe(
			(data) => {
				this.chapters = data;
			},
			(error) => {
				this.notificationService.error('Не удалось загрузить Ордена');
			}
		);
	}

	onChapterSelect(event: any) {
		const selectedChapterId = event.value;

		if (selectedChapterId) {
			this.spaceMarineForm.get('chapter.name')?.disable();
			this.spaceMarineForm.get('chapter.marinesCount')?.disable();
			this.spaceMarineForm.get('chapter.world')?.disable();

			const selectedChapter = this.chapters.find(chapter => chapter.id === selectedChapterId);
			if (selectedChapter) {
				this.spaceMarineForm.patchValue({
					chapter: {
						name: selectedChapter.name,
						marinesCount: selectedChapter.count,
						world: selectedChapter.world
					}
				});
			}
		} else {
			this.spaceMarineForm.get('chapter.name')?.enable();
			this.spaceMarineForm.get('chapter.marinesCount')?.enable();
			this.spaceMarineForm.get('chapter.world')?.enable();

			this.spaceMarineForm.get('chapter.name')?.reset();
			this.spaceMarineForm.get('chapter.marinesCount')?.reset();
			this.spaceMarineForm.get('chapter.world')?.reset();
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

	getOriginalKey(translatedKey: string, map: { [key: string]: string }): string {
		return Object.keys(map).find((key) => map[key] === translatedKey) || '';
	}

	onSubmit() {
		this.trimFormValues(this.spaceMarineForm);
		if (this.spaceMarineForm.valid) {
			const formData = this.spaceMarineForm.value;
			const payload = {
				...formData,
				category: this.getOriginalKey(formData.category, this.categories),
				weaponType: this.getOriginalKey(formData.weaponType, this.weapons),
			};

			this.spaceMarineService.add(payload).pipe(
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
					this.notificationService.success(response.message);
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

	protected readonly validateNumber = validateNumber;
}
