import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class AuthGuard implements CanActivate {
	constructor(private authService: AuthService, private router: Router) {}

	canActivate(): Observable<boolean> {
		return this.authService.verifyToken().pipe(
			map(isValid => {
				return isValid;
			}),
			catchError(() => {
				return of(false);
			})
		);
	}
}
