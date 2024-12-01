import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { SignInComponent } from '../signin/signin.component';
import { SignUpComponent } from '../signup/signup.component';
import { HomeComponent } from '../home/home.component';
import { HeaderModule } from '../header/header.module';
import { CreateSpaceMarineComponent } from '../create-space-marine/create-space-marine.component';
import { ControlPanelComponent } from '../control-panel/control-panel.component';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../header/header.component';
import { EditSpaceMarineComponent } from '../edit-space-marine/edit-space-marine.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		ToastrModule.forRoot(),
		RouterModule.forRoot(routes),
		HeaderModule,
		ReactiveFormsModule,
		CommonModule,
		FormsModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatOptionModule,
		MatButtonModule,
		MatIconModule,
		MatButtonToggleModule,
		MatTableModule,
		MatSortModule,
		MatPaginatorModule,
	],
	declarations: [
		AppComponent,
		SignInComponent,
		SignUpComponent,
		ControlPanelComponent,
		CreateSpaceMarineComponent,
		EditSpaceMarineComponent,
		HeaderComponent,
	],
	providers: [
		provideHttpClient(),
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
