import {Route} from '@angular/router';

import {MessageDetailsComponent} from './messages/message-details.component'
import {LoginComponent} from "./auth/login.component";
import {SignupComponent} from "./auth/signup.component";
import {RecoverComponent} from "./auth/recover.component";
import {ResetPasswordComponent} from "./auth/reset-password.component";
import {ProfileComponent} from "./userSetUp/profile.component";
import {MainComponent} from "./main.component";
import {ContactListComponent} from "./contact-tab/contact-list.component";

export const routes: Route[] = [
    {path: '', component: MainComponent},
    {path: 'message/:messageId', component: MessageDetailsComponent, canActivate: ['canActivateForLoggedIn']},
    {path: 'login', component: LoginComponent},
    {path: 'signup', component: SignupComponent},
    {path: 'recover', component: RecoverComponent},
    {path: 'reset-password/:token', component: ResetPasswordComponent},
    {path: 'profile', component: ProfileComponent},
    {path:'contact-list', component : ContactListComponent}
];

export const ROUTES_PROVIDERS = [{
    provide: 'canActivateForLoggedIn',
    useValue: () => !!Meteor.userId()
}];
