import {CollectionObject} from "./collection-object.model";
import {SafeUrl} from "@angular/platform-browser";

export interface CallRequest extends CollectionObject {
    targetUsersId: string[];
    onlineUsers: PeerUser[];
    rejectUsers: string[];
    ownerUserId: string;
    ownerName?: string;
    chatId: string;
    video: boolean;
}

export interface PeerUser {
    userId: string;
    profileId: string;
    peerId: string;
}

export interface CallUser {
    username: string;
    pictureId?: string;
    videoStream?: MediaStreamTrack;
    videoURL: SafeUrl;
}
