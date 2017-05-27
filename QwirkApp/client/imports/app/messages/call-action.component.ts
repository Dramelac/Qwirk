import {Component, Input, NgZone, OnDestroy, OnInit} from "@angular/core";
import template from "./call-action.component.html";
import "../../../lib/peer.js";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {CallRequest, Chat} from "../../../../both/models";
import {CallRequests} from "../../../../both/collections";
import {MeteorObservable} from "meteor-rxjs";

@Component({
    selector: 'call-action',
    template
})
export class CallActionComponent implements OnInit, OnDestroy {

    myVideo: SafeUrl;
    localStream: MediaStream;

    peerId: string;
    peer: PeerJs.Peer;
    currentCall: PeerJs.MediaConnection;

    distantVideo: SafeUrl[];
    remoteStream: MediaStream[];

    requestListId: string[];
    isCallActive: boolean;

    micButton: string;
    camButton: string;

    formId: string;

    @Input("chat") chat: Chat;

    constructor(private zone: NgZone, private sanitizer: DomSanitizer) {
    }

    ngOnInit(): void {
        this.peerId = "";
        this.isCallActive = false;
        this.micButton = "Mute";
        this.camButton = "Video";
        this.requestListId = [];
        this.remoteStream = [];
        this.distantVideo = [];

        Tracker.autorun(() => {
            let callId = Session.get("activeCall");
            //console.log("detect change ! , ", callId);
            this.checkInputCall();
        });

    }

    checkInputCall() {
        //console.log("checking call");
        if (Session.equals("activeCall", this.chat._id)) {
            console.log("activating call", Session.get("activeCall"), Session.get("callVideo"), Session.get("callPeerId"));
            this.initPeer(Session.get("callVideo"), () => {
                this.acceptCall(Session.get("callPeerId"))
            });
        }
    }

    ngOnDestroy(): void {
        //console.log("Destroy call");
        this.stopCall();
    }

    initPeer(video: boolean, callback = null) {
        // get audio/video
        navigator.getUserMedia = ( navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia );

        if (!navigator.getUserMedia) {
            console.error("undefined user media");
        }

        navigator.getUserMedia({audio: true, video: true}, (stream) => {
                //display video

                this.zone.run(() => {
                    this.myVideo = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(stream));
                });
                this.localStream = stream;

                if (!video) {
                    this.video();
                } else {
                    this.camButton = "Hide video"
                }
                //console.log("Test callback : ", callback);
                if (callback) {
                    //console.log("exec callback");
                    callback();
                }
            }, function (error) {
                console.log(error);
            }
        );
        this.micButton = "Mute";

        this.peer = new Peer({
            host: "qwirk-peerjs.herokuapp.com",
            port: 443,
            secure: true,
            debug: 3
        });

        this.peer.on('open', () => {
            this.zone.run(() => {
                this.peerId = this.peer.id;
            });
        });

        // This event: remote peer receives a call
        this.peer.on('call', (incomingCall) => {
            console.log("call received");
            this.isCallActive = true;

            this.currentCall = incomingCall;
            this.currentCall.answer(this.localStream);

            this.currentCall.on('stream', (remoteStream) => {
                this.remoteStream.push(remoteStream);
                this.zone.run(() => {
                    this.distantVideo.push(this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(remoteStream)));
                });
            });
        });

        this.peer.on('error', (err) => {
            console.log("Peer custom error : ", err);
        });

        this.peer.on('close', () => {
            console.log("close received");
            //this.stopCall();
        });

        this.peer.on('disconnect', () => {
            console.log("disconnect received");
            //this.stopCall();
        });
    }

    call(video: boolean): void {
        this.initPeer(video);

        this.peer.on('open', () => {
            this.chat.user.forEach((userId) => {
                if (userId !== Meteor.userId()) {
                    let reqId = CallRequests.collection.insert({
                        targetUserId: userId,
                        ownerUserId: Meteor.userId(),
                        peerId: this.peerId,
                        chatId: this.chat._id,
                        video: video,
                        isReject: false
                    });
                    this.requestListId.push(reqId);
                }
            });
            MeteorObservable.subscribe('myCallRequest', this.chat._id).subscribe(() => {
                MeteorObservable.autorun().subscribe(() => {
                    this.requestListId.forEach((reqId) => {
                        let request: CallRequest = CallRequests.findOne({_id: reqId});
                        if (request && request.isReject) {
                            this.detectReject(reqId);
                        }
                    });
                })
            });
        });
    }

    detectReject(reqId: string) {
        CallRequests.remove({_id: reqId});
        let index = this.requestListId.indexOf(reqId);
        if (index >= 0) {
            this.requestListId.splice(index, 1);
        }
        if (this.requestListId.length === 0) {
            this.stopCall();
        }
    }

    stopCall() {
        if (this.isCallActive) {
            this.peer.disconnect();
            this.currentCall.close();
            this.isCallActive = false;
        }
        if (this.peer) {
            this.peer.destroy();
        }
        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => {
                track.stop();
            });
        }
        this.zone.run(() => {
            this.myVideo = "";
            this.distantVideo = [];
            this.peerId = "";
        });
        Session.set("activeCall", null);
        Session.set("callPeerId", null);
        Session.set("callVideo", null);
    }

    acceptCall(callId?: string) {
        if (!callId) {
            callId = this.formId;
            this.initPeer(true);
        }
        console.log("accept call : ", callId, this.localStream);
        if (callId) {
            this.isCallActive = true;

            this.currentCall = this.peer.call(callId, this.localStream);
            this.currentCall.on('stream', (remoteStream) => {
                this.remoteStream.push(remoteStream);
                this.zone.run(() => {
                    this.distantVideo.push(this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(remoteStream)));
                });
            });
        }
    }

    mute() {
        this.localStream.getAudioTracks().forEach((track) => {
            track.enabled = !track.enabled;

            //TODO change to icon
            if (track.enabled) {
                this.micButton = "Mute";
            } else {
                this.micButton = "Unmute";
            }
        });
    }

    video() {
        this.localStream.getVideoTracks().forEach((track) => {
            track.enabled = !track.enabled;

            //TODO change to icon
            if (track.enabled) {
                this.camButton = "Hide video";
            } else {
                this.camButton = "Video";
            }
        });
    }

}