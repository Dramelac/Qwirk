import {MongoObservable} from "meteor-rxjs";
import {File} from "../models";
import {UploadFS} from "meteor/jalik:ufs";

export const Files = new MongoObservable.Collection<File>('files');

export const FilesStore = new UploadFS.store.GridFS({
    collection: Files.collection,
    name: 'files',
    // Apply a filter to restrict file upload
    filter: new UploadFS.Filter({
        minSize: 1,
        maxSize: 50 * (1024 * 1000), // 50MB
    }),
    permissions: new UploadFS.StorePermissions({
        insert(userId, file) {
            return !file.userId || file.userId === userId;
        },
        remove(userId, file) {
            return !file.userId || userId === file.userId;
        },
        update(userId, file) {
            return !file.userId || userId === file.userId;
        }
    }),
    onRead(fileId, file, request, response) {
        if (file.chatId) {
            return true;
            //response.writeHead(403);
            //return false;
        } else {
            return true;
        }
    }
});

Files.allow({
    remove: function (userId, doc) {
        return userId === doc.userId;
    },
});