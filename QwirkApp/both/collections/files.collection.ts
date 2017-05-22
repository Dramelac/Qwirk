import {MongoObservable} from "meteor-rxjs";
import {File} from "../models";
import {UploadFS} from "meteor/jalik:ufs";

export const Files = new MongoObservable.Collection<File>('files');

export const FilesStore = new UploadFS.store.GridFS({
    collection: Files.collection,
    name: 'files',
    permissions: new UploadFS.StorePermissions({
        insert(userId, file) {
            // allow anyone to upload a file, but check that uploaded file is attached to the user that uploads the file
            return !file.userId || file.userId === userId;
        },
        remove(userId, file) {
            // allow anyone to remove public files, but only owners to remove their files
            return !file.userId || userId === file.userId;
        },
        update(userId, file) {
            // allow anyone to update public files, but only owners to update their files
            return !file.userId || userId === file.userId;
        }
    }),
    onRead(fileId, file, request, response) {
        //TODO check chatId permission
        if (file.chatId) {
            return true;
        } else {
            response.writeHead(403);
            return false;
        }
    }
});