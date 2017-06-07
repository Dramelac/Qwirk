import {Component, NgZone, OnDestroy, OnInit} from "@angular/core";
import template from "./call-handler.component.html";
import style from "./call-handler.component.scss";
import "../../../lib/peer.js";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {CallRequest, CallUser, Chat, PeerUser, SessionKey} from "../../../../both/models";
import {CallRequests, Chats, Contacts, Profiles} from "../../../../both/collections";
import {MeteorObservable} from "meteor-rxjs";
import * as _ from "underscore";

@Component({
    selector: 'call-handler',
    template,
    styles: [style]
})
export class CallHandlerComponent implements OnInit, OnDestroy {

    myVideo: SafeUrl;
    localStream: MediaStream;
    myVideoStream: MediaStreamTrack;
    myPicture: string;

    peerId: string;
    peer: PeerJs.Peer;
    currentCall: PeerJs.MediaConnection[];

    remoteStream: MediaStream[];
    userList: CallUser[];

    requestId: string;
    isCallActive: boolean;
    isHost: boolean;

    micButton: boolean;
    camButton: boolean;
    hasCam: boolean;

    chat: Chat;
    isHide : boolean;

    constructor(private zone: NgZone, private sanitizer: DomSanitizer) {
    }

    ngOnInit(): void {
        this.peerId = "";
        this.isCallActive = false;
        this.micButton = true;
        this.camButton = true;
        this.hasCam = true;
        this.remoteStream = [];
        this.userList = [];
        this.currentCall = [];
        this.isHost = false;
        this.isHide = true;

        MeteorObservable.subscribe('profile').subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                let profile = Profiles.findOne({userId: Meteor.userId()});
                if (profile){
                    MeteorObservable.subscribe("file", profile.picture).subscribe(() => {
                        MeteorObservable.autorun().subscribe(() => {
                            this.myPicture = profile.picture;
                        });
                    });
                }
            });
        });

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
            /*console.log("activating call",
             Session.get(SessionKey.ActiveCall.toString()),
             "Video:", video,
             "CallId:", Session.get(SessionKey.CallId.toString()));*/
            if (Session.equals(SessionKey.IsHost.toString(), true)) {
                this.chat = Session.get(SessionKey.LaunchCallChat.toString());
                this.call(video);
            } else {
                this.requestId = Session.get(SessionKey.CallId.toString());
                this.initPeer(video, () => {
                    this.acceptCall(this.requestId);
                });
            }
        }
    }

    ngOnDestroy(): void {
        //console.log("Destroy call");
        this.stopCall();
    }

    initNavigator(stream) {
        //display video

        this.zone.run(() => {
            this.myVideo = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(stream));
        });
        this.localStream = stream;
    }

    initPeer(video: boolean, callback = null) {
        let execCallback = false;
        this.isHide = false;

        if (!navigator.mediaDevices.getUserMedia) {
            console.error("undefined user media");
        }

        let loadVideo;
        let self = this;
        navigator.mediaDevices.enumerateDevices().then(function (devices) {
                loadVideo = _.contains(devices.map((d) => {
                    return d.kind
                }), "videoinput");

                navigator.mediaDevices.getUserMedia({audio: true, video: loadVideo}).then((stream) => {
                    self.initNavigator(stream);

                    if (loadVideo && !video) {
                        self.video();
                    } else if (!loadVideo) {
                        self.hasCam = false;
                    } else {
                        self.camButton = false
                    }

                    self.myVideoStream = self.localStream.getVideoTracks()[0];

                    if (execCallback && callback) {
                        callback();
                    } else {
                        execCallback = true;
                    }

                }).catch((err) => {
                    console.log("Error on media loading :", err);
                });
            })
            .catch(function (err) {
                console.log(err.name + ": " + err.message);
            });

        this.micButton = true;

        //TODO update debug level
        this.peer = new Peer({
            host: "peer.qwirk.eu",
            port: 443,
            secure: true,
            debug: 3,
            path: "/qwirk"
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
                    $pull: {
                        targetUsersId: Meteor.userId(),
                        rejectUsers: Meteor.userId()
                    }
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

            incomingCall.on('close', () => {
                console.log("A peer disconnected");
                let index = this.userList.indexOf(this.userList.filter((u) => {
                    return u.peerId === incomingCall.peer;
                })[0]);
                if (index >= 0) {
                    this.zone.run(() => {
                        this.userList.splice(index, 1);
                    });
                }
            });

            incomingCall.on('stream', (remoteStream) => {
                this.remoteStream.push(remoteStream);
                let request = CallRequests.findOne({_id: this.requestId, "onlineUsers.peerId": incomingCall.peer});
                if (!request) return;
                let user: PeerUser[] = request.onlineUsers.filter((u) => {
                    return u.peerId === incomingCall.peer;
                });
                if (user.length > 0) {
                    this.zone.run(()=>{
                        this.addUserList(user[0], remoteStream);
                    });
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
                        this.stopCall();
                    }
                })
            });
        });
    }

    stopCall() {
        if (this.isHost) {
            CallRequests.remove({_id: this.requestId});
            this.isHost = false;
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
            this.currentCall.forEach((call) => {
                call.close();
            });
            this.peer.disconnect();
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
            this.isHide = true;
        });
        Session.set(SessionKey.ActiveCall.toString(), null);
        Session.set(SessionKey.CallId.toString(), null);
        Session.set(SessionKey.CallVideo.toString(), null);
        Session.set(SessionKey.LaunchCallChat.toString(), null);
        Session.set(SessionKey.IsHost.toString(), false);
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
                        console.log("[MANUAAL] Receive stream from", user.peerId);
                        this.remoteStream.push(remoteStream);
                        this.zone.run(()=>{
                            this.addUserList(user, remoteStream);
                        });

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
                tempUser = {
                    username: profile.username,
                    videoStream: stream.getVideoTracks().length >= 1 ? stream.getVideoTracks()[0] : null,
                    videoURL: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(stream)),
                    peerId: user.peerId
                };
                MeteorObservable.subscribe('contact',profile._id).subscribe(() => {
                    MeteorObservable.autorun().subscribe(() => {
                        let contact = Contacts.findOne({profileId : profile._id});
                        if (contact) {
                            tempUser.username = contact.displayName;
                        }
                    });
                });
                MeteorObservable.subscribe("file", profile.picture).subscribe(() => {
                    MeteorObservable.autorun().subscribe(() => {
                        this.zone.run(() => {
                            tempUser.pictureId = profile.picture;
                        });
                    });
                });
                this.zone.run(() => {
                    this.userList.push(tempUser);
                });
            } else {
                console.log("Error loading distant profile");
            }
        });
    }

    mute() {
        this.localStream.getAudioTracks().forEach((track) => {
            track.enabled = !track.enabled;

            this.micButton = track.enabled;
        });
    }

    video() {
        this.localStream.getVideoTracks().forEach((track) => {
            track.enabled = !track.enabled;

            this.camButton = !track.enabled;
        });
    }

}