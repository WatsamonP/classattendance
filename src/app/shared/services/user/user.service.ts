import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { User } from './user.model';

@Injectable()
export class UserService {

  selectedUser: User = new User();
  userList: AngularFireObject<any>;
  currentUserId : string;

  constructor(private db: AngularFireDatabase) { }

  setCurrentUserId(currentUserId : string){
    this.currentUserId = currentUserId;
  }
  

  getUserList(){
    this.userList = this.db.object(`users/${this.currentUserId}/profile`);
    return this.userList;
  }

  insertUser(user : User){
    this.getUserList().set({
      email: user.email,
      username : user.username,
      firstName : user.firstName,
      lastName : user.lastName,
      tel : user.tel
    });
  }

  updateUser(user : User){
    this.getUserList().update({
      email: user.email,
      username : user.username,
      firstName : user.firstName,
      lastName : user.lastName,
      tel : user.tel
    });
  }

  deleteUser(uid : string){
    this.getUserList().remove();
  }

}
