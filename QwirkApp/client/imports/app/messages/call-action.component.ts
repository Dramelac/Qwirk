import {Component, OnInit} from "@angular/core";
import template from "./call-action.component.html";
import "../../../lib/peer.js";

@Component({
    selector: 'call-action',
    template
})
export class CallActionComponent implements OnInit {

    myVideo: string;
    distantVideo: string;
    peerId: string;

    constructor() {
    }

    ngOnInit(): void {
        this.peerId = "";
    }

    call(video: boolean): void {
        if (!navigator.getUserMedia) {
            console.error("undefined user media");
        }
        // get audio/video
        navigator.getUserMedia({audio: true, video: video}, function (stream) {
                //display video
                //$('#myVideo').prop('src', URL.createObjectURL(stream));
                let url = URL.createObjectURL(stream);
                console.log(url);
                this.myVideo = url;
                this.window.localStream = stream;
            }, function (error) {
                console.log(error);
            }
        );

        window.peer = new Peer({
            key: 'u6sftzbkz3wka9k9',  // change this key
            debug: 3,
            config: {
                'iceServers': [
                    {url: 'stun:stun.l.google.com:19302'},
                    {url: 'stun:stun1.l.google.com:19302'},
                ]
            }
        });

        peer.on('open', function () {
            this.peerId = peer.id;
            console.log("id:", peer.id);
        });

        // This event: remote peer receives a call
        peer.on('call', function (incomingCall) {
            this.window.currentCall = incomingCall;
            incomingCall.answer(this.window.localStream);
            incomingCall.on('stream', function (remoteStream) {
                this.window.remoteStream = remoteStream;
                //$('#theirVideo').prop('src', URL.createObjectURL(remoteStream));
                this.distantVideo = URL.createObjectURL(remoteStream);
            });
        });

    }

}