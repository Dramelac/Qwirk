import {Component, Input, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import template from "./message-form.component.html";
import {Chat, File, MessageType} from "../../../../both/models";
import {Profiles} from "../../../../both/collections";

@Component({
    selector: 'message-form',
    template
})
export class MessageFormComponent implements OnInit {
    addForm: FormGroup;
    @Input('chat') chat: Chat;

    error: string;

    constructor(private formBuilder: FormBuilder) {
    }

    ngOnInit() {
        this.error = "";
        this.addForm = this.formBuilder.group({
            content: ['', Validators.required]
        });
    }

    addMessage(): void {
        if (!Meteor.userId()) {
            alert('Please log in to add a message');
            return;
        }
        if (this.addForm.valid) {
            this.error = "";
            if (this.chat.isAdmin && this.chat.type === "Groups") {
                if (this.checkGroupCommand()) {
                    return;
                }
            }

            Meteor.call("addMessage", MessageType.TEXT, this.chat._id, this.addForm.value.content,
                (error, result) => {
                    if (error) {
                        console.error("Error:", error);
                    }
                });
            //Messages.insert(Object.assign({}, this.addForm.value, { owner: Meteor.userId() }));

            this.addForm.reset();
        }
    }

    checkGroupCommand(): boolean {
        let input: string = this.addForm.value.content;
        let result: boolean = false;

        let command: string;
        let reason: string;
        let user: string;
        let time: number;
        let exec: boolean = false;

        //kick for specific time (+resaon)
        if (/^\/kick( .*)?$/.test(input)) {
            let arg = input.split(' ');
            if (arg.length < 3 || !/^\/kick [\S]+ [0-9]+ ?(.*)?$/.test(input)) {
                this.error = "Error syntax, command : /kick \<user\> \<time second\> [reason]";
            } else {
                let regexResult = /^\/kick [\S]+ [0-9]+ ?(.*)?$/.exec(input);
                command = "kick";
                reason = regexResult[1];
                user = arg[1];
                time = Number(arg[2]);
                console.log("detect kick user :", user, " , time :", time, " , reason :", reason);
                exec = true;
            }
            result = true;
        }

        //ban (+reason)
        if (/^\/ban( .*)?$/.test(input)) {
            let arg = input.split(' ');
            if (arg.length < 2 || !/^\/ban [\S]+ ?(.*)?$/.test(input)) {
                this.error = "Error syntax, command : /ban \<user\> [reason]";
            } else {
                let regexResult = /^\/ban [\S]+ ?(.*)?$/.exec(input);
                command = "ban";
                reason = regexResult[1];
                user = arg[1];
                time = Number(arg[2]);
                console.log("detect ban user :", user, " , reason :", reason);
                exec = true;
            }
            result = true;
        }

        //unban / promote / demote
        if (/^\/(promote|demote|unban)( .*)?$/.test(input)) {
            let arg = input.split(' ');
            let regexResult = /^\/(promote|demote|unban).*$/.exec(input);
            command = regexResult[1];
            if (arg.length < 2 || !/^\/(promote|demote|unban) [\S]+$/.test(input)) {
                this.error = "Error syntax, command : /" + command + " \<user\>";
            } else {
                user = arg[1];
                console.log("detect ", command, ", user :", user);
                exec = true;
            }
            result = true;
        }

        //help
        if (/^\/help( .*)?$/.test(input)) {
            this.error = "Command list : /kick /ban /unban /promote /demote";
            this.addForm.reset();
            result = true;
        }

        if (exec) {
            let targetUser = Profiles.findOne({username:user});
            if (targetUser){
                Meteor.call("groupCommand", command, this.chat._id, targetUser.userId, reason, time,
                    (error, result) => {
                        if (error) {
                            console.error("Error:", error);
                        }
                        if (result){
                            console.log("Result command :", result)
                        }
                    });

                this.addForm.reset();
            } else {
                this.error = "Error, user not found";
            }
        }

        return result;
    }

    onFileUploaded(file: File) {
        let type = /image\/.*/g.test(file.type) ? MessageType.PICTURE : MessageType.FILE;
        Meteor.call("addMessage", type, this.chat._id, file._id,
            (error, result) => {
                if (error) {
                    console.error("Error:", error);
                }
            });
    }

    sendWizz() {
        Meteor.call("addMessage", MessageType.WIZZ, this.chat._id, "wizz",
            (error, result) => {
                if (error) {
                    console.error("Error:", error);
                }
            });
    }

}