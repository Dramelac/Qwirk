import { CollectionObject } from './collection-object.model';
export interface Contact extends CollectionObject {
    ownerId: string,
    friendId: string,
    displayName?: string;
    chatId: string;
}