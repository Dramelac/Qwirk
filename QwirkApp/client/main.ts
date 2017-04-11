import "angular2-meteor-polyfills";
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {AppModule} from "./imports/app";

//TODO add production environment (at the end)
//enableProdMode();

Meteor.startup(() => {
   platformBrowserDynamic().bootstrapModule(AppModule);
});
