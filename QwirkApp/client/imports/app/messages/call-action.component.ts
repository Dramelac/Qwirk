import {Component, NgZone, OnInit, Input, OnDestroy} from "@angular/core";
import template from "./call-action.component.html";
import "../../../lib/peer.js";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

@Component({
    selector: 'call-action',
    template
})
export class CallActionComponent implements OnInit, OnDestroy {

    myVideo: SafeUrl;
    distantVideo: SafeUrl;
    peerId: string;
    peer: PeerJs.Peer;
    localStream: MediaStream;
    currentCall: PeerJs.MediaConnection;
    remoteStream: MediaStream;

    isCallActive: boolean;

    @Input("userCallingId") userCallingId: string;

    constructor(private zone: NgZone, private sanitizer: DomSanitizer) {
    }

    ngOnInit(): void {
        this.peerId = "";
        this.isCallActive = false;
    }

    ngOnDestroy(): void {
        //console.log("Destroy call");
        this.stopCall();
    }

    call(video: boolean): void {
        if (!navigator.getUserMedia) {
            console.error("undefined user media");
        }
        console.log("Calling : ", this.userCallingId);
        // get audio/video
        navigator.getUserMedia({audio: true, video: video}, (stream) => {
                //display video
                this.myVideo = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(stream));
                this.localStream = stream;
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

    stopCall(){
        if (this.isCallActive){
            this.peer.disconnect();
        }
        this.peer.destroy();
        this.localStream.getTracks().forEach((track)=>{
            track.stop();
        });
        this.myVideo = "";
        this.peerId = "";
    }

}