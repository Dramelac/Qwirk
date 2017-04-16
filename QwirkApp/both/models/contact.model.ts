import { CollectionObject } from './collection-object.model';
export interface Contact extends CollectionObject {
    userId: string,
    displayName?: string;
    chatId: string;
}