import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';
import { AuthService } from "../shared/services/auth.service";
import { UserService } from "../shared/services/user/user.service";
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  animations: [routerTransition()]
})
export class SignupComponent implements OnInit {
  isSubmit = null;
  userForm: FormGroup;
  authState: any = null;

  constructor(
    private afAuth: AngularFireAuth,
    private fb: FormBuilder,
    private auth: AuthService,
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router) { }

  ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {
    this.userForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[.][a-z]{2,4}$")
      ]),
      password: new FormControl('', [
        //Validators.pattern('^(?=.*[0–9])(?=.*[a-zA-Z])([a-zA-Z0–9]+)$'),
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(25)
      ]),
      username: new FormControl('',[
        Validators.required
      ]),
      firstName: new FormControl('',[
        Validators.required,
        Validators.pattern("^[a-zA-Zก-๙]+$")
      ]),
      lastName: new FormControl('',[
        Validators.required,
        Validators.pattern("^[a-zA-Zก-๙]+$")
      ]),
      tel: new FormControl('',[
        Validators.required,
        Validators.pattern("^\\d{9,10}$")
      ])
    });
  }
  //Validators
  get email() {
     return this.userForm.get('email');
  }
  get password() {
     return this.userForm.get('password');
  }
  get username() {
     return this.userForm.get('username');
  }
  get firstName() {
     return this.userForm.get('firstName');
  }
  get lastName() {
     return this.userForm.get('lastName');
  }
  get tel() {
     return this.userForm.get('tel');
  }

  signup() {
    this.isSubmit = true;
    if (this.userForm.invalid) {
      return;
    }
    this.auth.emailSignUp(this.userForm.value.email, this.userForm.value.password)
      .then((auth) => {
        if(this.auth.currentUserId == null || this.auth.currentUserId == "" || this.auth.currentUserId == undefined){

        }else{
          this.userService.setCurrentUserId(this.auth.currentUserId);
          this.userService.insertUser(this.userForm.value);
          this.toastr.success("สมัครสมาชิกสำเร็จ");
        }
    })
  }
}
