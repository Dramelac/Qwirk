import {Component, NgZone, OnInit, Input, OnDestroy} from "@angular/core";
import template from "./call-action.component.html";
import "../../../lib/peer.js";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {CallRequests} from "../../../../both/collections/call-request.collection";

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

    @Input("chatId") chatId: string;
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

    initPeer(video: boolean){
        if (!navigator.getUserMedia) {
            console.error("undefined user media");
        }
        // get audio/video
        navigator.getUserMedia = ( navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia );
        navigator.getUserMedia({audio: true, video: video}, (stream) => {
                //display video
                this.myVideo = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(stream));
                this.localStream = stream;
            }, function (error) {
                console.log(error);
            }
        );

        this.peer = new Peer({
            host: "qwirk-peerjs.herokuapp.com",
            port: 443,
            secure: true,
            debug: 3
        });

        this.peer.on('open', () => {
            this.peerId = this.peer.id;
        });

        // This event: remote peer receives a call
        this.peer.on('call', (incomingCall) => {
            console.log("call received");
            this.isCallActive = true;

            this.currentCall = incomingCall;
            this.currentCall.answer(this.localStream);

            this.currentCall.on('stream', (remoteStream) => {
                this.remoteStream = remoteStream;
                this.distantVideo = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.remoteStream))
            });
        });

        this.peer.on('error', (err) => {
            console.log("Peer custom error : ", err);
        });

        this.peer.on('disconnected', () => {
            console.log("disconnect received");
            this.stopCall();
        });
    }

    call(video: boolean): void {
        this.initPeer(video);

        console.log("Calling : ", this.userCallingId);
        CallRequests.insert({
            targetUserId: this.userCallingId,
            ownerUserId: Meteor.userId(),
            peerId: this.peerId,
            chatId: this.chatId,
            video: video});

    }

    stopCall() {
        if (this.isCallActive) {
            this.currentCall.close();
        }
        if (this.peer){
            this.peer.destroy();
        }
        if (this.localStream){
            this.localStream.getTracks().forEach((track) => {
                track.stop();
            });
        }
        this.zone.run(() => {
            this.myVideo = "";
            this.distantVideo = "";
            this.peerId = "";
        });
    }

    acceptCall(callId: string) {
        console.log("call : ", callId);
        if (callId) {
            this.isCallActive = true;

            this.currentCall = this.peer.call(callId, this.localStream);
            this.currentCall.on('stream', (remoteStream) => {
                this.remoteStream = remoteStream;
                this.distantVideo = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(remoteStream));
            });
        }
    }

}