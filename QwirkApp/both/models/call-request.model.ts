import {CollectionObject} from "./collection-object.model";

export interface CallRequest extends CollectionObject {
    targetUserId: string;
    ownerUserId: string;
    ownerName?: string;
    peerId: string;
    chatId: string;
    video: boolean;
    isReject: boolean;
}
