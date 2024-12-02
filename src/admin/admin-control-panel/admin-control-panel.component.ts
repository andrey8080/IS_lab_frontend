import {Component} from '@angular/core';
import {AdminService} from '../admin.service';
import {NgForOf, NgIf} from '@angular/common';
import {Observable} from 'rxjs';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';

@Component({
	selector: 'app-admin-panel',
	templateUrl: './admin-control-panel.component.html',
	imports: [NgForOf, MatIcon, MatIconButton, NgIf],
	standalone: true,
})
export class AdminControlPanelComponent {
	pendingApplications: any[] = [];

	constructor(private adminAuthService: AdminService) {
		this.loadPendingApplications();
	}

	loadPendingApplications() {
		const authToken = localStorage.getItem('authToken');
		if (!authToken) {
			alert('Вы не авторизованы');
			return;
		}

		this.adminAuthService.getPendingApplications(authToken).subscribe({
			next: (applications) => {
				this.pendingApplications = applications;
			},
			error: (err) => {
				alert('Ошибка загрузки заявок: ' + err.error.error);
			},
		});
	}

	approveApplication(username: string, isApproved: boolean) {
		this.adminAuthService.approveApplication(username, isApproved).subscribe(
			(response: any) => {
				alert(response.message);
				this.loadPendingApplications();
			},
			error => {
				console.error(error);
			},
		);
	}
}
