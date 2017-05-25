import { CollectionObject } from './collection-object.model';
import {Profile} from "./profile.model";
export interface Contact extends CollectionObject {
    ownerId: string,
    friendId: string,
    profileId:string,
    profile?: Profile,
    displayName?: string;
    chatId: string;
}