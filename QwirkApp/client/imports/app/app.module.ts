import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { AccountsModule } from 'angular2-meteor-accounts-ui';
import { MaterialModule } from "@angular/material";
import {MomentModule} from "angular2-moment";

import {AppComponent} from "./app.component";
import {routes, ROUTES_PROVIDERS} from './app.route';
import {MESSAGE_DECLARATIONS} from './messages';
import { SHARED_DECLARATIONS } from './shared';
import {AUTH_DECLARATIONS} from "./auth"
import {USERSETUP_DECLARATIONS} from "./userSetUp";
import {CONTACT_DECLARATIONS} from "./contact-tab";
import {MainComponent} from "./main.component";

@NgModule({
    // Components, Pipes, Directive
    declarations: [
        AppComponent,
        MainComponent,
        ...MESSAGE_DECLARATIONS,
        ...SHARED_DECLARATIONS,
        ...AUTH_DECLARATIONS,
        ...USERSETUP_DECLARATIONS,
        ...CONTACT_DECLARATIONS
    ],
    // Entry Components
    entryComponents: [
        AppComponent
    ],
    // Providers
    providers: [
        ...ROUTES_PROVIDERS
    ],
    // Modules
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forRoot(routes),
        AccountsModule,
        MaterialModule,
        MomentModule
    ],
    // Main Component
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor() {

    }
}
