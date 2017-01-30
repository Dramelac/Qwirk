import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {AppComponent} from "./app.component";
import {MESSAGE_DECLARATIONS} from './messages';

import {DemoComponent} from "./demo/demo.component";
import {DemoDataService} from "./demo/demo-data.service";

@NgModule({
    // Components, Pipes, Directive
    declarations: [
        AppComponent,
        DemoComponent,
        ...MESSAGE_DECLARATIONS
    ],
    // Entry Components
    entryComponents: [
        AppComponent
    ],
    // Providers
    providers: [
        DemoDataService
    ],
    // Modules
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule
    ],
    // Main Component
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor() {

    }
}
