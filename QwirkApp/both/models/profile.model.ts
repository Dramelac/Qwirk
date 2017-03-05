import { CollectionObject } from './collection-object.model';

export interface Profile extends CollectionObject {
    userId?: string;
    birthday?: Date;
    firstname: string;
    lastname: string;
    contacts: string[];
    status: number;
}
