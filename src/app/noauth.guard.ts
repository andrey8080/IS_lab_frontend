import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
	constructor(private authService: AuthService, private router: Router) {}

	canActivate(): Observable<boolean> {
		return this.authService.verifyToken().pipe(
			map(isLoggedIn => {
				if (isLoggedIn) {
					this.router.navigate(['/']);
					return false;
				}
				return true;
			}),
			catchError(() => {
				return of(true);
			})
		);
	}
}
