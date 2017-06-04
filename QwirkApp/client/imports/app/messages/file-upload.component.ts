import {Component, EventEmitter, Input, NgZone, OnInit, Output} from "@angular/core";
import template from "./file-upload.component.html";
import style from "./file-upload.component.scss";
import {FilesStore} from "../../../../both/collections";
import {UploadFS} from "meteor/jalik:ufs";
import "jquery";

@Component({
    selector: 'file-upload',
    template,
    styles: [style]
})
export class FileUploadComponent implements OnInit {
    fileIsOver: boolean = false;
    uploading: boolean = false;

    name: string;

    progress: string;
    speed: string;
    elapsed: string;
    remaining: string;

    error: string;

    @Input('chatId') chatId: string;
    @Output() onFile: EventEmitter<File> = new EventEmitter<File>();

    constructor(private zone: NgZone) {
    }

    ngOnInit(): void {
        this.error = "";
        
        $(document).ready(function () {
            $("body").bind('dragover', function () {
                $(".modal-file-drop").addClass('modal-file-drop-dragover');
            });
            $(".file-drop").bind('dragleave', function () {
                $(".modal-file-drop").removeClass('modal-file-drop-dragover');
            });
        });
    }

    fileOver(fileIsOver: boolean): void {
        this.fileIsOver = fileIsOver;
    }

    onFileSelectChange(){
        this.uploading = true;
        let file:File = $(".file-input").prop("files")[0];

        this.upload(file)
            .then((result) => {
                this.uploading = false;
                this.onFile.emit(result);
                $(".file-input").val("");
            })
            .catch((error) => {
                this.uploading = false;
                console.log(`Something went wrong!`, error);
            });

    }

    onFileDrop(file: File): void {
        this.uploading = true;
        $(".modal-file-drop").removeClass('modal-file-drop-dragover');

        this.upload(file)
            .then((result) => {
                this.uploading = false;
                this.onFile.emit(result);
            })
            .catch((error) => {
                this.uploading = false;
                console.log(`Something went wrong!`, error);
                this.error = error.reason;
            });
    }

    upload(data: File): Promise<any> {
        return new Promise((resolve, reject) => {
            const ONE_MB = 1024 * 1000;
            let self = this;
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
                store: FilesStore,
                onError: reject,
                onComplete: resolve
            });
            upload.onAbort = function (file) {
                console.info(file.name, "upload aborted");
            };
            upload.onProgress = function (file, progress) {
                self.zone.run(() => {
                    self.progress = (progress * 100).toFixed(2);
                    self.speed = (this.getSpeed() / 1024).toFixed(2);
                    self.elapsed = (this.getElapsedTime() / 1000).toFixed(2);
                    self.remaining = (this.getRemainingTime() / 1000).toFixed(2);
                });

                /*console.info(file.name + ' :'
                 + "\n" + self.progress + '%'
                 + "\n" + self.speed + 'KB/s'
                 + "\n" + 'elapsed: ' + self.elapsed + 's'
                 + "\n" + 'remaining: ' + self.remaining + 's'
                 );*/
            };

            upload.start();
        });
    }
}