import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { Course } from './course.model';
import { StringifyOptions } from 'querystring';
import { AuthService } from "../../../shared/services/auth.service";

@Injectable()
export class CourseService {

  selectedCourse: Course = new Course();
  courseList: AngularFireList<any>;
  courseObject: AngularFireObject<any>;
  selectedCourseId : number;
  selectedCourseKey : string;

  constructor(
    private db: AngularFireDatabase,
    private auth: AuthService) { }

  // GET-SET Data
  getCourseObject(){
    //this.courseList = this.db.list(`testUser/${this.auth.currentUserId}/course/`);
    this.courseObject = this.db.object(`testUser/${this.auth.currentUserId}/course/`);
    return this.courseObject;
  }
  getCourseList(){
    this.courseList = this.db.list(`testUser/${this.auth.currentUserId}/course/`);
    //this.courseList = this.db.object(`testUser/${this.auth.currentUserId}/course/`);
    return this.courseList;
  }
  setCourseId(id : number){
    this.selectedCourseId = id;
  }
  getCourseId(){
    //console.log(this.selectedCourseId);
    return this.selectedCourseId;
  }
  setCourseKey(key : string){
    this.selectedCourseKey = key;
  }
  getCourseKey(){
    return this.selectedCourseKey;
  }

  // INSERT UPDATE DELETE
  insertCourse(course : Course){
    this.db.object(`testUser/${this.auth.currentUserId}/course/${course.id}`).set({
      id: course.id,
      name : course.name,
      year : course.year,
      trimester : course.trimester
    });
  /*
    const path = `testUser/${this.auth.currentUserId}/course/${course.id}`; // Endpoint on firebase
    const userRef: AngularFireObject<any> = this.db.object(path);
    const data = {
      Hello: '423434',
    }
    userRef.set(data)
      .catch(error => console.log(error));
    }
    */
  }

  updateCourse(course : Course){
    /*
    this.getCourseList().update(course.id,{
      id: course.id,
      name : course.name,
      year : course.year,
      trimester : course.trimester
    });
    */
  }

  deleteCourse(key : string){
    this.db.object(`testUser/${this.auth.currentUserId}/course/${key}`).remove();
  }

}
  
