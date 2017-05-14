import {CollectionObject} from "./collection-object.model";

export enum MessageType {
    TEXT = <any>'text',
    PICTURE = <any>'picture'
}

export interface Message extends CollectionObject {
    chatId?: string;
    content?: string;
    createdAt?: Date;
    ownerId?: string;
    ownership?: string;
    type?: MessageType
}
