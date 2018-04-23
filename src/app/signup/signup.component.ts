import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';
import { AuthService } from "../shared/services/auth.service";
import { UserService } from "../shared/services/user/user.service";
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

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

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService,
    private userService: UserService) { }

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
      this.userService.setCurrentUserId(this.auth.currentUserId)})
      .then(() => {
        this.userService.insertUser(this.userForm.value)})
  }
}
