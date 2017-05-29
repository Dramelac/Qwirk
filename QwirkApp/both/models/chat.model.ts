import {CollectionObject} from "./collection-object.model";
import {Message} from "./message.model";

export enum ChatType {
    CHAT = <any>'Chats',
    GROUP = <any>'Groups'
}

export interface Chat extends CollectionObject {
    user: string[];
    admin: string[];
    ban?: string[];
    publicly: boolean;
    title?: string;
    picture?: string;
    lastMessage?: Message;
    blocked?: boolean;
    type:ChatType;
    isAdmin?:boolean;
    ownerId?:string;
}
