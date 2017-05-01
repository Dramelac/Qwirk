import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {AccountsModule} from "angular2-meteor-accounts-ui";
import {MaterialModule} from "@angular/material";
import {MomentModule} from "angular2-moment";
import "hammerjs";
import "autolinker";
import {AppComponent} from "./app.component";
import {routes, ROUTES_PROVIDERS} from "./app.route";
import {MESSAGE_DECLARATIONS} from "./messages";
import {SHARED_DECLARATIONS} from "./shared";
import {AUTH_DECLARATIONS} from "./auth";
import {USERS_DECLARATIONS} from "./user";
import {CONTACT_DECLARATIONS} from "./contact-tab";
import {MENU_DECLARATIONS} from "./menu";

@NgModule({
    // Components, Pipes, Directive
    declarations: [
        AppComponent,
        ...MESSAGE_DECLARATIONS,
        ...SHARED_DECLARATIONS,
        ...AUTH_DECLARATIONS,
        ...USERS_DECLARATIONS,
        ...CONTACT_DECLARATIONS,
        ...MENU_DECLARATIONS
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
