import {CollectionObject} from "./collection-object.model";
import {Contact} from "./contact.model"

export interface Profile extends CollectionObject {
    userId?: string;
    birthday?: Date;
    firstname?: string;
    lastname?: string;
    contacts?: Contact[];
    status?: number;
    username?: string;
    picture?: string;
}
