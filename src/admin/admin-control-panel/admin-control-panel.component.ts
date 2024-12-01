import { Component } from '@angular/core';
import { AdminService } from '../admin.service';
import { NgForOf } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-admin-panel',
	templateUrl: './admin-control-panel.component.html',
	imports: [NgForOf],
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

	approveApplication(username: string) {
		const token: string = <string>localStorage.getItem('token');
		this.adminAuthService.approveApplication(username, token).subscribe({
			next: () => {
				alert(`Заявка пользователя ${username} одобрена`);
				this.loadPendingApplications();
			},
			error: (err) => {
				alert('Ошибка утверждения заявки: ' + err.error.error);
			},
		});
	}
}
