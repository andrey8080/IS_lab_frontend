import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {WebSocketService} from '../services/web-socket.service';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
	isLoggedIn = false;
	username: string | null = null;

	constructor(private authService: AuthService, private webSocketService : WebSocketService, private router: Router) {}

	ngOnInit(): void {
		this.authService.isLoggedIn$.subscribe(status => {
			this.isLoggedIn = status;
		});
		this.authService.name$.subscribe(name => {
			this.username = name;
		});

	}

	goHome() {
		this.router.navigate(['/']);
	}

	logout() {
		this.authService.logout();
		this.webSocketService.disconnect();
		this.goHome();
	}

	login() {
		this.router.navigate(['/login']);
	}

	signup() {
		this.router.navigate(['/signup']);
	}
}
