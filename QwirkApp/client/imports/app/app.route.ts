import {Route} from "@angular/router";
import {MessageDetailsComponent} from "./messages/message-details.component";
import {LoginComponent} from "./auth/login.component";
import {SignupComponent} from "./auth/signup.component";
import {RecoverComponent} from "./auth/recover.component";
import {ResetPasswordComponent} from "./auth/reset-password.component";
import {ProfileComponent} from "./user/profile.component";
import {MessagesListComponent} from "./messages/messages-list.component";
import {VerifyMailComponent} from "./auth/verify-mail.component";
import {AddGroupComponent} from "./group/add-group.component";

export const routes: Route[] = [
    {path: 'message/:messageId', component: MessageDetailsComponent, canActivate: ['canActivateForLoggedIn']},
    {path: 'chat/:chatId', component: MessagesListComponent, canActivate: ['canActivateForLoggedIn']},
    {path: 'group/:chatId', component: MessagesListComponent, canActivate: ['canActivateForLoggedIn']},
    {path: 'login', component: LoginComponent, canActivate: ['anonymous']},
    {path: 'signup', component: SignupComponent, canActivate: ['anonymous']},
    {path: 'recover', component: RecoverComponent, canActivate: ['anonymous']},
    {path: 'reset-password/:token', component: ResetPasswordComponent},
    {path: 'verify-email/:token', component: VerifyMailComponent},
    {path: 'profile/:profileID', component: ProfileComponent},
    {path: 'profile', component: ProfileComponent, canActivate: ['canActivateForLoggedIn']},
    {path: 'addGroup/:groupId', component: AddGroupComponent, canActivate: ['canActivateForLoggedIn']},
    {path: 'addGroup', component: AddGroupComponent, canActivate: ['canActivateForLoggedIn']}
];

export const ROUTES_PROVIDERS = [{
    provide: 'canActivateForLoggedIn',
    useValue: () => !!Meteor.userId()
},{
    provide: 'anonymous',
    useValue: () => !Meteor.userId()
}];
