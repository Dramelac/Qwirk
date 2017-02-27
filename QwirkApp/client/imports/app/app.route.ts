import {Route} from '@angular/router';

import {MessagesListComponent} from './messages/messages-list.component';
import {MessageDetailsComponent} from './messages/message-details.component'
import {LoginComponent} from "./auth/login.component";
import {SignupComponent} from "./auth/signup.component";
import {RecoverComponent} from "./auth/recover.component";
import {ResetPasswordComponent} from "./auth/reset-password.component";
import {ProfileComponent} from "./userSetUp/profile.component";

export const routes: Route[] = [
    {path: '', component: MessagesListComponent},
    {path: 'message/:messageId', component: MessageDetailsComponent, canActivate: ['canActivateForLoggedIn']},
    {path: 'login', component: LoginComponent},
    {path: 'signup', component: SignupComponent},
    {path: 'recover', component: RecoverComponent},
    {path: 'reset-password/:token', component: ResetPasswordComponent},
    {path: 'profile', component: ProfileComponent}
];

export const ROUTES_PROVIDERS = [{
    provide: 'canActivateForLoggedIn',
    useValue: () => !!Meteor.userId()
}];
