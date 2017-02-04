import {Route} from '@angular/router';

import {MessagesListComponent} from './messages/messages-list.component';
import {MessageDetailsComponent} from './messages/message-details.component'

export const routes: Route[] = [
    {path: '', component: MessagesListComponent},
    {path: 'message/:messageId', component: MessageDetailsComponent, canActivate: ['canActivateForLoggedIn']}
];

export const ROUTES_PROVIDERS = [{
    provide: 'canActivateForLoggedIn',
    useValue: () => !! Meteor.userId()
}];
