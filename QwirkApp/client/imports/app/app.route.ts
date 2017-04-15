import {Route} from "@angular/router";
import {MessageDetailsComponent} from "./messages/message-details.component";
import {LoginComponent} from "./auth/login.component";
import {SignupComponent} from "./auth/signup.component";
import {RecoverComponent} from "./auth/recover.component";
import {ResetPasswordComponent} from "./auth/reset-password.component";
import {ProfileComponent} from "./user/profile.component";
import {ContactListComponent} from "./contact-tab/contact-list.component";
import {MessagesListComponent} from "./messages/messages-list.component";
import {VerifyMailComponent} from "./auth/verify-mail.component";

export const routes: Route[] = [
    {path: 'message/:messageId', component: MessageDetailsComponent, canActivate: ['canActivateForLoggedIn']},
    {path: 'chat/:chatId', component: MessagesListComponent, canActivate: ['canActivateForLoggedIn']},
    {path: 'login', component: LoginComponent},
    {path: 'signup', component: SignupComponent},
    {path: 'recover', component: RecoverComponent},
    {path: 'reset-password/:token', component: ResetPasswordComponent},
    {path: 'verify-email/:token', component: VerifyMailComponent},
    {path: 'profile', component: ProfileComponent},
    {path:'contact-list', component : ContactListComponent}
];

export const ROUTES_PROVIDERS = [{
    provide: 'canActivateForLoggedIn',
    useValue: () => !!Meteor.userId()
}];
