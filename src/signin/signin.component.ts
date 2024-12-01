import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	ValidationErrors,
	Validators
} from '@angular/forms';
import CryptoJS from 'crypto-js';
import {ToastrService} from 'ngx-toastr';
import {catchError, timeout} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {noWhitespaceValidator} from '../validators/custom-validators';


@Component({
	selector: 'app-signin',
	standalone: true,
	templateUrl: './signin.component.html',
	imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterLink, FormsModule, ReactiveFormsModule]
})
export class SignInComponent implements OnInit{
	signInForm!: FormGroup;

	constructor(private authService: AuthService,
				private router: Router,
				private fb: FormBuilder,
				private toastr: ToastrService
	) {}

	ngOnInit() {
		this.signInForm = this.fb.group(
			{
				name: ['', [Validators.required, noWhitespaceValidator]],
				password: ['', [Validators.required, Validators.minLength(6), noWhitespaceValidator]],
			}
		);
	}

	onLogin() {
		if (this.signInForm.invalid) {
			this.toastr.error('Пожалуйста, заполните форму корректно.');
			return;
		}

		const hashedPassword = CryptoJS.MD5(this.signInForm.get('password')?.value).toString();
		const formData = {
			name: this.signInForm.get('name')?.value,
			password: hashedPassword
		};

		this.authService.login(formData).pipe(
			timeout(3000),
			catchError(error => {
				if (error.name === 'TimeoutError') {
					this.toastr.error('Сервер не отвечает. Превышено время ожидания.', 'Ошибка входа:');
				} else if (error.status === 0) {
					this.toastr.error('Сервер недоступен', 'Ошибка входа:');
				} else if (error.status === 401) {
					this.toastr.error('Пользователь не найден. Проверьте введенные данные.', 'Ошибка входа:');
				} else {
					this.toastr.error(error.message || 'Неизвестная ошибка', 'Ошибка входа:');
				}
				return throwError(() => error);
			})
		).subscribe(
			(response: any) => {
				if (response.token) {
					this.toastr.success('Успешный вход!', 'Успех');
					this.authService.setToken(response.token, formData.name);
					this.router.navigate(['/']);
				}
			},
			error => {
				console.error(error);
			}
		);
	}
}
