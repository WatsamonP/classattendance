import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';
import { AuthService } from "../shared/services/auth.service";
import { ReactiveFormsModule, FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [routerTransition()]
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  email: string;
  password: string;

  constructor(
    public router: Router,
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    auth.getCurrentLoggedIn();
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl('', [
        //Validators.pattern('^(?=.*[0–9])(?=.*[a-zA-Z])([a-zA-Z0–9]+)$'),
        Validators.minLength(6),
        Validators.maxLength(25)
      ])
    });
  }
  
  onLoggedin() {
    localStorage.setItem('isLoggedin', 'true');
    //this.auth.emailLogin(this.loginForm.value.email, this.loginForm.value.password)
  }
  
  login(): void {
    this.auth.emailLogin(this.loginForm.value.email, this.loginForm.value.password);
    localStorage.setItem('isLoggedin', 'true');
    //Storage
    }
}
