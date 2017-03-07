import { CollectionObject } from './collection-object.model';

export enum MessageType {
    TEXT = <any>'text'
}

export interface Message extends CollectionObject {
    chatId?: string;
    content?: string;
    createdAt?: Date;
    ownership?: string;
    type?: MessageType
}
