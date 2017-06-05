import "angular2-meteor-polyfills";
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {AppModule} from "./imports/app";
import {enableProdMode} from "@angular/core";

enableProdMode();

Meteor.startup(() => {
   platformBrowserDynamic().bootstrapModule(AppModule);
});
