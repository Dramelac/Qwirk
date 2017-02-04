import { CollectionObject } from './collection-object.model';

export interface Message extends CollectionObject {
    content: string;
    user: string;
    owner?: string;
    publicly: boolean;
}
