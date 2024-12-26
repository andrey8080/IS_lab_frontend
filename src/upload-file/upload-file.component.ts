import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpEventType, HttpHeaders} from '@angular/common/http';
import {NgForOf, NgIf} from '@angular/common';
import {NotificationService} from '../services/notification.service';
import {Chapter} from '../models/space-marine.model';
import {environment} from '../../environment';

@Component({
	selector: 'app-upload-file',
	templateUrl: './upload-file.component.html',
	styleUrls: ['./upload-file.component.css'],
	imports: [
		NgForOf,
		NgIf
	],
	standalone: true
})
export class UploadFileComponent implements OnInit {
	selectedFile: File | null = null;
	uploadProgress: number | null = null;
	uploadStatus: string | null = null;

	history: any[] = [];

	constructor(private http: HttpClient, private notificationService: NotificationService) {
	}

	ngOnInit(): void {
		this.loadHistory();
	}

	private loadHistory(): void {
		this.http.post<Chapter[]>(`${environment.apiUrl}/file/getHistory`, null, {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('authToken')}`
			})
		}).subscribe(
			(data) => {
				this.history = data;
			},
			(error) => {
				this.notificationService.error('Не удалось загрузить историю');
			}
		);
	}

	onFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input?.files?.length) {
			this.selectedFile = input.files[0];
			this.uploadStatus = null;
			console.log('Файл выбран:', this.selectedFile);
		}
	}

	onUpload(): void {
		if (!this.selectedFile) {
			return;
		}

		const formData = new FormData();
		formData.append('file', this.selectedFile);

		const fileCreationDate = new Date(this.selectedFile.lastModified).toISOString();
		formData.append('fileCreationDate', fileCreationDate); // Добавляем дату в форму

		this.http
			.post(`${environment.apiUrl}/file/upload`, formData, {
				headers: new HttpHeaders({
					'Authorization': `Bearer ${localStorage.getItem('authToken')}`
				}),
				reportProgress: true,
			})
			.subscribe({
				next: (event: any) => {
					if (event.type === HttpEventType.UploadProgress && event['total']) {
						// Отображаем прогресс загрузки
						this.uploadProgress = Math.round((event['loaded'] / event['total']) * 100);
					} else if (event.type === HttpEventType.Response) {
						// Успешная загрузка
						this.notificationService.success('Файл успешно загружен!');
						this.history = event.body;
						this.uploadProgress = null;
					}
				},
				error: (error) => {
					// Обработка ошибок при загрузке
					this.notificationService.error(error.error.error);
					this.uploadProgress = null;
				},
			});
	}
}
