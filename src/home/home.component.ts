import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {SpaceMarineService} from '../services/space-marine.service';
import {WebSocketService} from '../services/web-socket.service';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';
import {NotificationService} from '../services/notification.service';
import {DatePipe, NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {FormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatIconButton} from '@angular/material/button';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css'],
	imports: [
		MatIconModule,
		MatButtonToggleModule,
		MatTableModule,
		MatSortModule,
		MatPaginatorModule,
		MatIconButton,
		MatLabel,
		MatFormField,
		FormsModule,
		NgIf,
		MatInput,
	],
	providers: [DatePipe],
	standalone: true
})
export class HomeComponent implements OnInit, OnDestroy {
	displayedColumns: string[] = ['id', 'userName', 'coordinates', 'creationDate', 'name', 'chapterName', 'chapterCount', 'chapterWorld', 'height', 'health', 'category', 'weaponType', 'edit', 'delete'];

	spaceMarines: any[] = [];
	dataSource = new MatTableDataSource<any>();
	isLoggedIn = false;
	currentUserName: string | null = '';
	selectedView: 'all' | 'mine' = 'all';
	isLoading = false;
	isAdmin = false;

	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

	constructor(
		private authService: AuthService,
		private router: Router,
		private spaceMarineService: SpaceMarineService,
		private datePipe: DatePipe,
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
						this.loadSpaceMarines();
					}
				});
			}
		});
		this.authService.isAdminIn$.subscribe((isAdmin) => {
			this.isAdmin = isAdmin;
		});
	}

	ngOnDestroy() {
		this.webSocketService.disconnect();
	}

	control_panel() {
		this.router.navigate(['/control-panel']);
	}

	toggleView() {
		this.loadSpaceMarines();
	}

	loadSpaceMarines() {
		if (this.isLoading) {
			return;
		}
		this.isLoading = true;

		const loadMethod = this.selectedView === 'all'
			? this.spaceMarineService.getAllSpaceMarines()
			: this.spaceMarineService.getUserSpaceMarines();

		loadMethod.subscribe(
			(data) => {
				this.spaceMarines = data;
				this.dataSource.data = data;
				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
				this.isLoading = false;
			},
			(error) => {
				this.isLoading = false;
			}
		);
	}

	applyFilter(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input) {
			this.dataSource.filter = input.value.trim().toLowerCase();
		}
	}

	sortTable(column: string): void {
		this.dataSource.sort = this.sort;
	}

	editMarine(marine: any) {
		this.router.navigate([`/control-panel/edit/${marine.id}`]);
	}

	deleteMarine(marine: any) {
		this.spaceMarineService.delete(marine.id).subscribe({
			next: (response) => {
				this.notificationService.success('Space Marine удален', 'Успех');
				this.loadSpaceMarines();
			},
			error: (error) => {
				this.notificationService.error('Произошла ошибка при удалении объекта');
			}
		});
	}

	formatDate(date: string): string {
		return this.datePipe.transform(date, 'dd.MM.yyyy HH:mm:ss')!;
	}

	space_marine_map() {
		this.router.navigate([`/space-marine-map`])
	}
}
