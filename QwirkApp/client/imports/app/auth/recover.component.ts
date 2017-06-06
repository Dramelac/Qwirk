import {Component, OnInit, NgZone} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import template from "./recover.component.html";

@Component({
    selector: 'recover',
    template
})
export class RecoverComponent implements OnInit {
    recoverForm: FormGroup;
    error: string;
    success: string;

    constructor(private router: Router, private zone: NgZone, private formBuilder: FormBuilder) {
    }

    ngOnInit() {
        this.recoverForm = this.formBuilder.group({
            email: ['', Validators.required]
        });

        this.error = '';
        this.success = '';
    }

    recover() {
        this.error = "";
        this.success = "";
        if (this.recoverForm.valid) {
            this.success = "Sending ...";
            Accounts.forgotPassword({email: this.recoverForm.value.email}
            , (err) => {
                if (err) {
                    this.zone.run(() => {
                        this.error = err.reason;
                        this.success = "";
                    });
                } else {
                    this.success = "Operation succeed ! You will receive a link to reset your password.";
                }
            });
            this.recoverForm.reset();
        }
    }
}