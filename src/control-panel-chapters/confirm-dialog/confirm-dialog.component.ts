import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogContent, MatDialogModule, MatDialogTitle} from '@angular/material/dialog';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatOptionModule} from '@angular/material/core';

@Component({
	selector: 'app-confirm-dialog',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatDialogContent,
		MatDialogTitle,
		MatRadioGroup,
		MatFormFieldModule,
		MatDialogModule,
		MatButtonModule,
		MatSelectModule,
		MatOptionModule,
		MatRadioButton
	],
	templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {
	action: 'delete' | 'reassign' = 'delete';
	newChapterId: string | null = null;

	constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
