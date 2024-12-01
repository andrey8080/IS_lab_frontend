import { AbstractControl, ValidatorFn } from '@angular/forms';

export function noWhitespaceValidator(control: AbstractControl) {
	const isWhitespace = typeof control.value === 'string' && control.value.trim().length === 0;
	return !isWhitespace ? null : { noWhitespace: true };
}

export function minValue(min: number): ValidatorFn {
	return (control: AbstractControl) => {
		const value = parseFloat(control.value);
		return value >= min ? null : { min: true };
	};
}

export function maxValue(max: number): ValidatorFn {
	return (control: AbstractControl) => {
		const value = parseFloat(control.value);
		return value <= max ? null : { max: true };
	};
}

export function validateNumber(event: Event, type: 'integer' | 'float') {
	const input = event.target as HTMLInputElement;
	if (type === 'integer') {
		input.value = input.value.replace(/[^-?\d]/g, '');
	} else if (type === 'float') {
		input.value = input.value.replace(/[^-?\d.]/g, '');
		if (input.value.indexOf('.') !== input.value.lastIndexOf('.')) {
			input.value = input.value.slice(0, input.value.lastIndexOf('.'));
		}
		if (input.value.indexOf('-') > 0) {
			input.value = input.value.replace('-', '');
		}
	}
}

