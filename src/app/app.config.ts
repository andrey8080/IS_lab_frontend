import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideToastr } from 'ngx-toastr';
import {provideAnimations} from '@angular/platform-browser/animations';

export const appConfig = [
	provideRouter(routes)
];
