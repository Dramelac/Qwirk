import {CollectionObject} from "./collection-object.model";

export enum MessageType {
    TEXT = <any>'text',
    PICTURE = <any>'picture',
    FILE = <any>'file',
    WIZZ = <any>'wizz',
    ANNOUNCE = <any>'announce'
}

export interface Message extends CollectionObject {
    chatId?: string;
    content?: string;
    createdAt?: Date;
    ownerId?: string;
    ownership?: string;
    type?: MessageType,
    ownerName?: string;
    ownerPictureId?: string;
    readBy: string[];
}
