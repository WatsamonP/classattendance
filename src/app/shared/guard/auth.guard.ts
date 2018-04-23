import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../services/auth.service';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private auth: AuthService
  ) {}

  canActivate(next: ActivatedRouteSnapshot,state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.afAuth.authState
      .take(1)
      .map(user => !!user)
      .do(loggedIn => {
        if (!loggedIn) {
        this.router.navigate(['/login']);
      }
      })
    }
    
  
  /*
  canActivate() {
    if(localStorage.getItem('isLoggedin')  ) {
      return true;//&& this.auth.loggedIn()
    }
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      console.log(this.auth.authState+'//'+this.auth.loggedIn())
      return false;
    
  }
  */
}
