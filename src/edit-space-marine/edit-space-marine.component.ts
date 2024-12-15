import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SpaceMarineService} from '../services/space-marine.service';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {SpaceMarine} from '../models/space-marine.model';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {maxValue, minValue, validateNumber} from '../validators/custom-validators';
import {MatOptionModule} from '@angular/material/core';
import {catchError, timeout} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {ChapterService} from '../services/chapter.service';

@Component({
	selector: 'app-edit-space-marine',
	templateUrl: './edit-space-marine.component.html',
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
	]
})
export class EditSpaceMarineComponent implements OnInit {
	spaceMarineForm: FormGroup;
	marineId: number | null = null;
	marineData: SpaceMarine | null = null;

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

	constructor(
		private route: ActivatedRoute,
		private spaceMarineService: SpaceMarineService,
		private chapterService: ChapterService,
		private fb: FormBuilder,
		private router: Router,
		private toastr: ToastrService
	) {
		this.spaceMarineForm = this.fb.group({
			name: ['1', [Validators.required]],
			coordinates: this.fb.group({
				x: ['1', [Validators.required, minValue(-585)]],
				y: ['1', [Validators.required, maxValue(118)]],
			}),
			health: ['1', [Validators.required, minValue(0)]],
			height: ['1', [Validators.pattern(/^-?\d+(\.\d{1,15})?$/), minValue(0)]],
			category: ['', [Validators.required]],
			weaponType: ['', [Validators.required]],
			chapter: this.fb.group({
				id: [''],
				name: ['', [Validators.required]],
				marinesCount: ['', [Validators.required, Validators.pattern(/^-?\d+$/), minValue(0)]],
				world: [''],
			}),
		});
	}

	ngOnInit(): void {
		this.loadChapters();
		this.route.paramMap.subscribe(params => {
			this.marineId = Number(params.get('id'));
			if (this.marineId) {
				this.loadMarineData(this.marineId);
			}
		});
	}

	loadMarineData(id: number) {
		this.spaceMarineService.getSpaceMarineById(id).subscribe(
			(data) => {
				this.marineData = data;

				const existingChapter = this.chapters.find(chapter => chapter.name === data.chapter.name);

				this.spaceMarineForm.patchValue({
					name: data.name,
					coordinates: {
						x: data.coordinates_x,
						y: data.coordinates_y,
					},
					health: data.health,
					height: data.height,
					category: data.category,
					weaponType: data.weaponType,
					chapter: {
						id: existingChapter.id,
						name: existingChapter.name,
						marinesCount: existingChapter.count,
						world: existingChapter.world,
					},
				});
				this.spaceMarineForm.get('chapter.name')?.disable();
				this.spaceMarineForm.get('chapter.marinesCount')?.disable();
				this.spaceMarineForm.get('chapter.world')?.disable();

			},
			(error) => {
				this.toastr.error(error, 'Ошибка при загрузке данных:');
			}
		);
	}

	private loadChapters() {
		this.chapterService.getChapters().subscribe(
			(data) => {
				this.chapters = data;
			},
			(error) => {
				this.toastr.error('Не удалось загрузить Ордена');
			}
		);
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

			this.spaceMarineService.updateSpaceMarine(this.marineId, payload).pipe(
				timeout(3000),
				catchError(error => {
					if (error.name === 'TimeoutError') {
						this.toastr.error('Сервер не отвечает. Превышено время ожидания.', 'Ошибка входа:');
					} else if (error.status === 0) {
						this.toastr.error('Сервер недоступен', 'Ошибка входа:');
					} else {
						this.toastr.error(error.message || 'Неизвестная ошибка',);
					}
					return throwError(() => error);
				})
			).subscribe(
				(response: any) => {
					this.toastr.success(response.message);
					this.router.navigate(['/']);
				},
				error => {
					console.error(error);
				}
			);
		} else {
			this.toastr.error('Форма содержит ошибки!', 'Ошибка');
		}
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

	protected readonly validateNumber = validateNumber;
}
