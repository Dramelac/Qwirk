import {Component, NgZone, OnInit} from "@angular/core";
import template from "./call-action.component.html";
import "../../../lib/peer.js";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

@Component({
    selector: 'call-action',
    template
})
export class CallActionComponent implements OnInit {

    myVideo: SafeUrl;
    distantVideo: SafeUrl;
    peerId: string;
    peer: PeerJs.Peer;
    localStream: MediaStream;
    currentCall: PeerJs.MediaConnection;
    remoteStream: MediaStream;

    isCallActive: boolean;

    constructor(private zone: NgZone, private sanitizer: DomSanitizer) {
    }

    ngOnInit(): void {
        this.peerId = "";
        this.isCallActive = false;
    }

    call(video: boolean): void {
        if (!navigator.getUserMedia) {
            console.error("undefined user media");
        }
        // get audio/video
        navigator.getUserMedia({audio: true, video: video}, (stream) => {
                //display video
                this.myVideo = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(stream));
                this.localStream = stream;
                console.log(this.myVideo);
            }, function (error) {
                console.log(error);
            }
        );

        this.peer = new Peer({
            key: 'u6sftzbkz3wka9k9',  // change this key
            debug: 3
        });

        this.peer.on('open', () => {
            this.peerId = this.peer.id;
        });

        // This event: remote peer receives a call
        this.peer.on('call', (incomingCall) => {
            console.log("call received");

            this.currentCall = incomingCall;
            this.currentCall.answer(this.localStream);

            this.currentCall.on('stream', (remoteStream) => {
                this.remoteStream = remoteStream;
                this.distantVideo = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.remoteStream));
                this.isCallActive = true;
            });
        });

    }

}