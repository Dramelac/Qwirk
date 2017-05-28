import {CollectionObject} from "./collection-object.model";

export interface CallRequest extends CollectionObject {
    targetUsersId: string[];
    onlineUsers: string[];
    rejectUsers: string[];
    ownerUserId: string;
    ownerName?: string;
    peerId: string[];
    chatId: string;
    video: boolean;
}
