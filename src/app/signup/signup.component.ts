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

  userForm: FormGroup;
  email: string;
  password: string;
  username? : string;
  firstName? : string;
  lastName? : string;
  tel? : number;
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
        Validators.email
      ]),
      password: new FormControl('', [
        //Validators.pattern('^(?=.*[0–9])(?=.*[a-zA-Z])([a-zA-Z0–9]+)$'),
        Validators.minLength(6),
        Validators.maxLength(25)
      ]),
      username: new FormControl(''),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      tel: new FormControl('')
    });
  }

  signup() {
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
