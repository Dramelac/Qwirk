import {Component, NgZone, OnDestroy, OnInit} from "@angular/core";
import template from "./call-handler.component.html";
import "../../../lib/peer.js";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {CallRequest, CallUser, Chat, PeerUser, SessionKey} from "../../../../both/models";
import {CallRequests, Chats, Profiles} from "../../../../both/collections";
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

    remoteStream: MediaStream[];
    userList: CallUser[];

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
        this.userList = [];
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
                "Video:", video,
                "CallId:", Session.get(SessionKey.CallId.toString()));
            if (Session.equals(SessionKey.IsHost.toString(), true)) {
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
                CallRequests.update(this.requestId, {
                    $push: {
                        onlineUsers: {
                            userId: Meteor.userId(),
                            profileId: Meteor.user().profile.id,
                            peerId: this.peer.id
                        }
                    },
                    $pull: {targetUsersId: Meteor.userId()}
                });
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

            console.log("stream call receive:", incomingCall.peer, incomingCall);

            incomingCall.on('close', () => {
                console.log("A peer disconnected");
                //TODO remove old client
            });

            incomingCall.on('stream', (remoteStream) => {
                this.remoteStream.push(remoteStream);
                let request = CallRequests.findOne({_id: this.requestId, "onlineUsers.peerId": incomingCall.peer});
                if (!request) return;
                let user: PeerUser[] = request.onlineUsers.filter((u) => {
                    return u.peerId === incomingCall.peer;
                });
                if (user.length > 0) {
                    this.addUserList(user[0], remoteStream);
                }
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
                onlineUsers: [{
                    userId: Meteor.userId(),
                    profileId: Meteor.user().profile.id,
                    peerId: this.peer.id
                }],
                rejectUsers: [],
                ownerUserId: Meteor.userId(),
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
                    onlineUsers: {
                        userId: Meteor.userId()
                    }
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
            this.userList = [];
            this.peerId = "";
        });
        Session.set(SessionKey.ActiveCall.toString(), null);
        Session.set(SessionKey.CallId.toString(), null);
        Session.set(SessionKey.CallVideo.toString(), null);
    }

    acceptCall(callId: string) {
        let onlineUsers: PeerUser[];
        let request = CallRequests.findOne(callId);
        if (!request) return;
        onlineUsers = request.onlineUsers;
        this.chat = Chats.findOne({_id: request.chatId});

        MeteorObservable.subscribe('callrequest').subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                let request: CallRequest = CallRequests.findOne({_id: this.requestId});
                if (!request) {
                    //console.log("End call detected");
                    this.stopCall();
                }
            })
        });

        if (onlineUsers) {
            this.isCallActive = true;

            onlineUsers.forEach((user) => {
                if (user.peerId !== this.peerId) {
                    let currentCall = this.peer.call(user.peerId, this.localStream);
                    currentCall.on('stream', (remoteStream) => {
                        this.remoteStream.push(remoteStream);
                        this.addUserList(user, remoteStream);

                    });
                    this.currentCall.push(currentCall);
                }
            });
        }
    }

    addUserList(user: PeerUser, stream: MediaStream) {
        let tempUser: CallUser;
        MeteorObservable.subscribe('profiles', user.userId).subscribe(() => {
            let profile = Profiles.findOne({_id: user.profileId});
            if (profile) {
                //TODO update to contact name
                tempUser = {
                    username: profile.username,
                    videoStream: stream.getVideoTracks().length >= 1 ? stream.getVideoTracks()[0] : null,
                    videoURL: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(stream))
                }
                ;
                MeteorObservable.subscribe("file", profile.picture).subscribe(() => {
                    MeteorObservable.autorun().subscribe(() => {
                        tempUser.pictureId = profile.picture;
                    });
                });
                this.userList.push(tempUser);
            } else {
                console.log("Error loading distant profile");
            }
        });
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