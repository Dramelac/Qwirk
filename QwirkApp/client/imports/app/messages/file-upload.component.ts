import {Component, EventEmitter, Input, Output} from "@angular/core";

import template from "./file-upload.component.html";
import {ImagesStore} from "../../../../both/collections/images.collection";
import {UploadFS} from "meteor/jalik:ufs";

@Component({
    selector: 'file-upload',
    template
})
export class FileUploadComponent {
    fileIsOver: boolean = false;
    uploading: boolean = false;

    name: string;

    progress: string;
    speed: string;
    elapsed: string;
    remaining: string;

    @Input('chatId') chatId: string;
    @Output() onFile: EventEmitter<string> = new EventEmitter<string>();

    constructor() {}

    fileOver(fileIsOver: boolean): void {
        this.fileIsOver = fileIsOver;
    }

    onFileDrop(file: File): void {
        this.uploading = true;

        this.upload(file)
            .then((result) => {
                this.uploading = false;
                this.onFile.emit(result._id);
                console.log("uploading");
            })
            .catch((error) => {
                this.uploading = false;
                console.log(`Something went wrong!`, error);
            });
    }

    upload(data: File): Promise<any> {
        return new Promise((resolve, reject) => {
            const ONE_MB = 1024 * 1000;
            let self=this;
            this.name = data.name;

            // pick from an object only: name, type and size
            const file = {
                name: data.name,
                type: data.type,
                size: data.size,
                chatId: this.chatId
            };

            const upload = new UploadFS.Uploader({
                adaptive: true,// use adaptive transfer speed
                chunkSize: ONE_MB,// default chunk size
                maxChunkSize: ONE_MB * 10,
                data: data,
                file: file,
                store: ImagesStore,
                onError: reject,
                onComplete: resolve
            });
            upload.onAbort = function (file) {
                console.info(`${file.name} upload aborted`);
            };
            upload.onProgress = function (file, progress) {
                self.progress = (progress * 100).toFixed(2);
                self.speed = (this.getSpeed() / 1024).toFixed(2);
                self.elapsed = (this.getElapsedTime() / 1000).toFixed(2);
                self.remaining = (this.getRemainingTime() / 1000).toFixed(2);

                console.info(file.name + ' :'
                    + "\n" + self.progress + '%'
                    + "\n" + self.speed + 'KB/s'
                    + "\n" + 'elapsed: ' + self.elapsed + 's'
                    + "\n" + 'remaining: ' + self.remaining + 's'
                );
            };

            upload.start();
        });
    }
}