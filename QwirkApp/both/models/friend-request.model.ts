import { CollectionObject } from './collection-object.model';

export interface FriendRequest extends CollectionObject {
    initiator: string;
    message: string;
    destinator: string;

}
