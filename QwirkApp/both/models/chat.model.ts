import { CollectionObject } from './collection-object.model';
import {Message} from "./message.model";

export interface Chat extends CollectionObject {
    user: string[];
    admin: string[];
    publicly: boolean;
    title?: string;
    picture?: string;
    lastMessage?: Message;
}
