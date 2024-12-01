import {Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, HostListener} from '@angular/core';
import { SpaceMarineService } from '../services/space-marine.service';
import { WebSocketService } from '../services/web-socket.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Component({
	selector: 'app-space-marine-map',
	templateUrl: './space-marine-map.component.html',
	styleUrls: ['./space-marine-map.component.css'],
	standalone: true
})
export class SpaceMarineMapComponent implements OnInit, OnDestroy, AfterViewInit {
	spaceMarines: any[] = [];
	isLoggedIn = false;
	currentUserName: string | null = '';
	isLoading = false;
	selectedMarine: any | null = null;

	@ViewChild('mapCanvas') mapCanvas!: ElementRef<HTMLCanvasElement>;
	private canvasContext: CanvasRenderingContext2D | null = null;

	constructor(
		private authService: AuthService,
		private router: Router,
		private spaceMarineService: SpaceMarineService,
		private notificationService: NotificationService,
		private webSocketService: WebSocketService
	) {}

	ngOnInit() {
		this.authService.isLoggedIn$.subscribe((loggedIn) => {
			this.isLoggedIn = loggedIn;
			if (this.isLoggedIn) {
				this.currentUserName = this.authService.getCurrentUserName();
				this.loadSpaceMarines();

				this.webSocketService.connect();
				this.webSocketService.getMessages().subscribe((message) => {
					if (message === 'add' || message === 'update' || message === 'delete') {
						console.log('redraw')
						this.loadSpaceMarines();
					}
				});
			}
		});
	}

	ngAfterViewInit() {
		const canvas = this.mapCanvas.nativeElement;
		this.canvasContext = canvas.getContext('2d');

		if (!this.canvasContext) {
			return;
		}

		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;
		this.canvasContext.translate(centerX, centerY);
		this.clearCanvas();
		this.drawAxis();
		canvas.addEventListener('click', (event) => this.handleCanvasClick(event));
	}

	ngOnDestroy() {
		this.webSocketService.disconnect();
	}

	loadSpaceMarines() {
		const loadMethod = this.spaceMarineService.getAllSpaceMarines();
		loadMethod.subscribe(
			(data) => {
				this.spaceMarines = data;
				this.isLoading = false;
				this.clearCanvas();
				this.drawMarinesOnCanvas();
			},
			(error) => {
				this.isLoading = false;
				console.error('Ошибка при загрузке SpaceMarine\'ов:', error);
			}
		);
	}

	clearCanvas() {
		if (this.canvasContext) {
			this.canvasContext.clearRect(0, 0, this.mapCanvas.nativeElement.width, this.mapCanvas.nativeElement.height);
		}
	}

	drawAxis() {
		if (this.canvasContext) {
			const canvas = this.mapCanvas.nativeElement;

			// X
			this.canvasContext.beginPath();
			this.canvasContext.moveTo(-canvas.width / 2, 0);
			this.canvasContext.lineTo(canvas.width / 2, 0);
			this.canvasContext.strokeStyle = 'black';
			this.canvasContext.lineWidth = 1;
			this.canvasContext.stroke();

			// Y
			this.canvasContext.beginPath();
			this.canvasContext.moveTo(0, -canvas.height / 2);
			this.canvasContext.lineTo(0, canvas.height / 2);
			this.canvasContext.strokeStyle = 'black';
			this.canvasContext.lineWidth = 1;
			this.canvasContext.stroke();
		}
	}

	drawMarinesOnCanvas() {
		console.log('draw')
		if (this.canvasContext) {
			this.spaceMarines.forEach((marine) => {
				const lat = parseFloat(marine.coordinates_x);
				const lng = parseFloat(marine.coordinates_y);

				if (!isNaN(lat) && !isNaN(lng)) {
					const x = lat * 10;
					const y = -lng * 10;
					this.drawMarker(x, y, marine);
				}
			});
		}
	}

	drawMarker(x: number, y: number, marine: any) {
		if (this.canvasContext) {
			this.canvasContext.beginPath();
			this.canvasContext.arc(x, y, 5, 0, Math.PI * 2);
			this.canvasContext.fillStyle = 'red';
			this.canvasContext.fill();
			this.canvasContext.stroke();

			this.canvasContext.fillStyle = 'black';
			this.canvasContext.font = '12px Arial';
			this.canvasContext.fillText(marine.name, x + 8, y);
		}
	}

	handleCanvasClick(event: MouseEvent) {
		const canvas = this.mapCanvas.nativeElement;
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left - canvas.width / 2;
		const y = event.clientY - rect.top - canvas.height / 2;


		this.spaceMarines.forEach((marine) => {
			const lat = parseFloat(marine.coordinates_x);
			const lng = parseFloat(marine.coordinates_y);

			const markerX = lat * 10;
			const markerY = -lng * 10;

			const distance = Math.sqrt(Math.pow(x - markerX, 2) + Math.pow(y - markerY, 2));
			if (distance < 10) {
				this.selectedMarine = marine;
				this.showDialog();
			}
		});
	}

	showDialog() {
		const dialog = document.getElementById('marineDialog');
		if (dialog) {
			dialog.style.display = 'block';
		}
	}

	hideDialog() {
		const dialog = document.getElementById('marineDialog');
		if (dialog) {
			dialog.style.display = 'none';
		}
	}

	editMarine() {
		this.hideDialog();
		this.router.navigate([`/control-panel/edit/${this.selectedMarine.id}`]);
	}

	deleteMarine() {
		this.spaceMarineService.delete(this.selectedMarine.id).subscribe({
			next: (response) => {
				this.notificationService.success('Space Marine удален', 'Успех');
				this.loadSpaceMarines();
			},
			error: (error) => {
				this.notificationService.error('Произошла ошибка при удалении объекта');
			}
		});
		this.hideDialog();
	}

	@HostListener('document:keydown', ['$event'])
	handleKeyboardEvent(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			this.hideDialog();
		}
	}
}
