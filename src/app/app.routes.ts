import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from '../home/home.component';
import {SignInComponent} from '../signin/signin.component';
import {SignUpComponent} from '../signup/signup.component';
import {EditSpaceMarineComponent} from '../edit-space-marine/edit-space-marine.component';
import {CreateSpaceMarineComponent} from '../create-space-marine/create-space-marine.component';
import {ControlPanelComponent} from '../control-panel/control-panel.component';
import {CreateChapterComponent} from '../create-chapter/create-chapter.component';
import {AuthGuard} from './auth.guard';
import {ControlPanelChaptersComponent} from '../control-panel-chapters/control-panel-chapters.component';
import {SpaceMarineMapComponent} from '../space-marine-map/space-marine-map.component';
import {AdminSignupComponent} from '../admin/admin-signup/admin-signup.component';
import {AdminControlPanelComponent} from '../admin/admin-control-panel/admin-control-panel.component';

export const routes: Routes = [
	{path: 'login', component: SignInComponent},
	{path: 'signup', component: SignUpComponent},

	{path: '', component: HomeComponent, canActivate: [AuthGuard]},
	{path: 'control-panel', component: ControlPanelComponent, canActivate: [AuthGuard]},
	{path: 'control-panel/create-space-marine', component: CreateSpaceMarineComponent, canActivate: [AuthGuard]},
	{path: 'control-panel/create-chapter', component: CreateChapterComponent, canActivate: [AuthGuard]},
	{path: 'control-panel/edit/:id', component: EditSpaceMarineComponent, canActivate: [AuthGuard]},

	{path: 'control-panel-chapter', component: ControlPanelChaptersComponent, canActivate: [AuthGuard]},

	{path: 'space-marine-map', component: SpaceMarineMapComponent, canActivate: [AuthGuard]},

	{path: 'admin-signup', component: AdminSignupComponent},
	{path: 'admin-panel', component: AdminControlPanelComponent},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
