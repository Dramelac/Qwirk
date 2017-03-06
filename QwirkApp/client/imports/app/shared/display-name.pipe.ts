import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'displayName'
})
export class DisplayNamePipe implements PipeTransform {
    transform(user: Meteor.User): string {
        if (!user) {
            return '';
        }

        if (user.username) {
            return user.username;
        }

        if (user.emails) {
            return user.emails[0].address;
        }

        return '';
    }
}