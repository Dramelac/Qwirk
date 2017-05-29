import {Component, NgZone, OnDestroy, OnInit} from "@angular/core";
import template from "./call-handler.component.html";
import "../../../lib/peer.js";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {CallRequest, Chat, SessionKey} from "../../../../both/models";
import {CallRequests, Chats} from "../../../../both/collections";
import {MeteorObservable} from "meteor-rxjs";

@Component({
    selector: 'call-handler',
    template
})
export class CallHandlerComponent implements OnInit, OnDestroy {

    myVideo: SafeUrl;
    localStream: MediaStream;

    peerId: string;
    peer: PeerJs.Peer;
    currentCall: PeerJs.MediaConnection[];

    distantVideo: SafeUrl[];
    remoteStream: MediaStream[];

    requestId: string;
    isCallActive: boolean;
    isHost: boolean;

    micButton: string;
    camButton: string;

    chat: Chat;

    constructor(private zone: NgZone, private sanitizer: DomSanitizer) {
    }

    ngOnInit(): void {
        this.peerId = "";
        this.isCallActive = false;
        this.micButton = "Mute";
        this.camButton = "Video";
        this.remoteStream = [];
        this.distantVideo = [];
        this.currentCall = [];
        this.isHost = false;

        Tracker.autorun(() => {
            let isCall = Session.get(SessionKey.ActiveCall.toString());
            //console.log("detect change ! , ", callId);
            this.checkInputCall();
        });

    }

    checkInputCall() {
        //console.log("checking call");
        let video = Session.get(SessionKey.CallVideo.toString());
        if (Session.equals(SessionKey.ActiveCall.toString(), true)) {
            console.log("activating call",
                Session.get(SessionKey.ActiveCall.toString()),
                "Video:",video,
                "CallId:", Session.get(SessionKey.CallId.toString()));
            if (Session.equals(SessionKey.IsHost.toString(),true)){
                this.chat = Session.get(SessionKey.LaunchCallChat.toString());
                this.call(video);
            } else {
                this.requestId = Session.get(SessionKey.CallId.toString());
                this.initPeer(video, () => {
                    this.acceptCall(Session.get(SessionKey.CallId.toString()))
                });
            }
        }
    }

    ngOnDestroy(): void {
        //console.log("Destroy call");
        this.stopCall();
    }

    initPeer(video: boolean, callback = null) {
        let execCallback = false;
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

                if (execCallback) {
                    //console.log("Test callback : ", callback);
                    if (callback) {
                        //console.log("exec callback");
                        callback();
                    }
                } else {
                    execCallback = true;
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
            if (!this.isHost) {
                console.log("Add peer id", this.peer.id);
                CallRequests.update(this.requestId, {$push: {peerId: this.peer.id}});
            }
            if (execCallback) {
                //console.log("Test callback : ", callback);
                if (callback) {
                    //console.log("exec callback");
                    callback();
                }
            } else {
                execCallback = true;
            }
        });

        // This event: remote peer receives a call
        this.peer.on('call', (incomingCall) => {
            console.log("call received");
            this.isCallActive = true;

            this.currentCall.push(incomingCall);
            incomingCall.answer(this.localStream);

            incomingCall.on('stream', (remoteStream) => {
                this.remoteStream.push(remoteStream);
                this.zone.run(() => {
                    this.distantVideo.push(this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(remoteStream)));
                });
            });
        });

        this.peer.on('error', (err) => {
            console.log("Peer custom error : ", err);
            this.stopCall();
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
        this.isHost = true;
        this.initPeer(video);

        this.peer.on('open', () => {
            this.requestId = CallRequests.collection.insert({
                targetUsersId: this.chat.user.filter((u) => {
                    return u !== Meteor.userId();
                }),
                onlineUsers: [Meteor.userId()],
                rejectUsers: [],
                ownerUserId: Meteor.userId(),
                peerId: [this.peerId],
                chatId: this.chat._id,
                video: video
            });
            MeteorObservable.subscribe('myCallRequest', this.chat._id).subscribe(() => {
                MeteorObservable.autorun().subscribe(() => {
                    let request: CallRequest = CallRequests.findOne({
                        _id: this.requestId,
                        ownerUserId: Meteor.userId()
                    });
                    if (request && request.onlineUsers.length === 1 && request.targetUsersId.length === 0) {
                        this.ownerStopCall();
                    }
                })
            });
        });
    }

    ownerStopCall() {
        CallRequests.remove({_id: this.requestId});
        this.isHost = false;
        this.stopCall();
    }

    stopCall() {
        if (this.isHost) {
            this.ownerStopCall();
            return;
        } else {
            CallRequests.update(this.requestId, {
                $pull: {
                    onlineUsers: Meteor.userId(),
                    peerId: this.peerId
                },
                $push: {rejectUsers: Meteor.userId()}
            });
        }
        if (this.isCallActive) {
            this.peer.disconnect();
            this.currentCall.forEach((call) => {
                call.close();
            });
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
        Session.set(SessionKey.ActiveCall.toString(), null);
        Session.set(SessionKey.CallId.toString(), null);
        Session.set(SessionKey.CallVideo.toString(), null);
    }

    acceptCall(callId: string) {
        let peerId: string[];
        let request = CallRequests.findOne(callId);
        if (!request) return;
        peerId = request.peerId;
        this.chat = Chats.findOne({_id:request.chatId});

        MeteorObservable.subscribe('callrequest').subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                let request: CallRequest = CallRequests.findOne({_id: this.requestId});
                if (!request) {
                    //console.log("End call detected");
                    this.stopCall();
                }
            })
        });

        if (peerId) {
            this.isCallActive = true;

            peerId.forEach((id) => {
                if (id !== this.peerId) {
                    let currentCall = this.peer.call(id, this.localStream);
                    currentCall.on('stream', (remoteStream) => {
                        this.remoteStream.push(remoteStream);
                        this.zone.run(() => {
                            this.distantVideo.push(this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(remoteStream)));
                        });
                    });
                    this.currentCall.push(currentCall);
                }
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