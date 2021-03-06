import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';
import { AuthService } from "../shared/services/auth.service";
import { ReactiveFormsModule, FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

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
  closeResult: string;

  constructor(
    public router: Router,
    private fb: FormBuilder,
    private auth: AuthService,
    private toastr: ToastrService,
    private modalService: NgbModal
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

  openForgotPassword(content) {
    this.modalService.open(content).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
    } else {
        return  `with: ${reason}`;
    }
  }

  forgotPassword(){
    console.log(this.loginForm.value.email);
    if(this.loginForm.value.email == undefined || this.loginForm.value.email == '' || this.loginForm.value.email == null ){
      this.toastr.warning("กรุณากรอก Email");
    }else{
      this.auth.resetPassword(this.loginForm.value.email);    
    }
  }
}
