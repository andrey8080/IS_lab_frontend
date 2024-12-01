import {Component} from '@angular/core';
import {AdminService} from '../admin.service';
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	ValidationErrors,
	Validators
} from '@angular/forms';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {NgIf} from '@angular/common';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {noWhitespaceValidator} from '../../validators/custom-validators';
import * as CryptoJS from 'crypto-js';
import {catchError, timeout} from 'rxjs/operators';
import {throwError} from 'rxjs';

@Component({
	selector: 'app-admin-register',
	templateUrl: './admin-signup.component.html',
	imports: [FormsModule, MatError, MatFormField, MatInput, MatLabel, NgIf, ReactiveFormsModule],
	standalone: true,
})
export class AdminSignupComponent {
	signUpForm!: FormGroup;

	constructor(
		private authService: AuthService,
		private adminAuthService: AdminService,
		private router: Router,
		private toastr: ToastrService,
		private fb: FormBuilder
	) {
	}

	ngOnInit() {
		this.signUpForm = this.fb.group(
			{
				username: ['', [Validators.required, Validators.minLength(1), noWhitespaceValidator]],
				password: ['', [Validators.required, Validators.minLength(6), noWhitespaceValidator]],
				confirmPassword: ['', [Validators.required, this.matchPasswords.bind(this)]],
				reason: ['', Validators.required]
			}
		);
	}

	matchPasswords(control: AbstractControl): ValidationErrors | null {
		const password = this.signUpForm?.get('password')?.value;
		const confirmPassword = control.value;
		return password !== confirmPassword ? {mismatch: true} : null;
	}

	onSignup() {
		if (this.signUpForm.invalid) {
			this.toastr.error('Пожалуйста, заполните форму корректно.');
			return;
		}

		const hashedPassword = CryptoJS.MD5(this.signUpForm.get('password')?.value).toString();
		const formData = {
			name: this.signUpForm.get('username')?.value,
			password: hashedPassword,
			isAdmin: true
		};
		const adminRequestData = {
			name: formData.name,
			reason: this.signUpForm.get('reason')?.value
		}

		this.adminAuthService.signup(formData, adminRequestData).pipe(
			timeout(3000),
			catchError(error => {
				if (error.name === 'TimeoutError') {
					this.toastr.error('Превышено время ожидания.', 'Ошибка сервера:');
				} else if (error.status === 409) {
					this.toastr.info("Данный логин занят, попробуйте другой или войдите в существующий аккаунт");
				} else if (error.status === 0) {
					this.toastr.error('Сервер недоступен', 'Ошибка сервера');
				}
				return throwError(() => error);
			})
		).subscribe(
			(response: any) => {
				if (response.token) {
					this.toastr.success('Ожидайте её обработки', 'Ваша заявка подана');
					this.authService.setToken(response.token, formData.name);
					this.router.navigate(['/']);
				} else {
					this.toastr.error(response.error, 'Ошибка регистрации');
				}
			},
			error => {
				this.toastr.error(error, 'Ошибка регистрации');
			}
		);
	}
}
