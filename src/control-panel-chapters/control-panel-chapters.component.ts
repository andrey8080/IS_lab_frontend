import { Component, OnInit } from '@angular/core';
import { ChapterService } from '../services/chapter.service';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { NgForOf, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NotificationService } from '../services/notification.service';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@Component({
	selector: 'app-control-panel',
	standalone: true,
	imports: [
		FormsModule,
		MatButton,
		NgForOf,
		NgIf,
		MatIcon,
		MatIconButton,
		MatDialogModule
	],
	templateUrl: './control-panel-chapters.component.html',
	providers: [ChapterService]
})
export class ControlPanelChaptersComponent implements OnInit {
	chapters: any[] = [];

	constructor(
		private router: Router,
		private chapterService: ChapterService,
		private notificationService: NotificationService,
		private dialog: MatDialog
	) {}

	ngOnInit(): void {
		this.loadChapters();
	}

	private loadChapters(): void {
		this.chapterService.getChapters().subscribe(
			(data) => {
				this.chapters = data;
			},
			(error) => {
				this.notificationService.error('Не удалось загрузить Ордена');
			}
		);
	}

	create_chapter(): void {
		this.router.navigate(['/control-panel/create-chapter']);
	}

	deleteChapter(chapter: any): void {
		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			width: '400px',
			data: {
				chapter,
				availableChapters: this.chapters.filter((ch) => ch.id !== chapter.id) // Исключаем удаляемый орден
			}
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result) {
				const { action, newChapterId } = result;

				if (action === 'reassign') {
					this.chapterService.delete(chapter.id, { newChapterId: newChapterId }).subscribe({
						next: () => {
							this.notificationService.success('Связанные объекты переназначены, орден удален.', 'Успех');
							this.loadChapters();
						},
						error: () => {
							this.notificationService.error('Произошла ошибка при переназначении.');
						}
					});
				} else if (action === 'delete') {
					this.chapterService.delete(chapter.id, { deleteSpaceMarines: true }).subscribe({
						next: () => {
							this.notificationService.success('Chapter и SpaceMarine удалены', 'Успех');
							this.loadChapters();
						},
						error: () => {
							this.notificationService.error('Произошла ошибка при удалении Chapter и SpaceMarine.');
						}
					});
				}
			}
		});
	}
}
