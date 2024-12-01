import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HeaderModule } from '../header/header.module';
import { AuthService } from '../services/auth.service';
import { NgIf } from '@angular/common';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, RouterLink, HeaderModule, NgIf],
	templateUrl: './app.component.html',
	styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
	title = 'Lab1';
	isLoggedIn = false;
	isRootPath = false;

	constructor(private authService: AuthService, private router: Router) {}

	ngOnInit() {
		this.authService.verifyToken().subscribe();
		this.authService.isLoggedIn$.subscribe((loggedIn) => {
			this.isLoggedIn = loggedIn;
		});
		this.router.events.subscribe(() => {
			this.isRootPath = this.router.url === '/';
		});
	}
}
