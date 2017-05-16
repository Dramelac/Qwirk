import {MongoObservable} from "meteor-rxjs";
import {Image} from "../models";
import {UploadFS} from "meteor/jalik:ufs";

export const Images = new MongoObservable.Collection<Image>('images');

export const ImagesStore = new UploadFS.store.GridFS({
    collection: Images.collection,
    name: 'images',
    filter: new UploadFS.Filter({
        contentTypes: ['image/*']
    }),
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