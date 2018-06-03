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
  selectedGroup : string;

  constructor(
    private db: AngularFireDatabase,
    private auth: AuthService) { }

  // GET-SET Data
  getCourseObject(){
    //this.courseList = this.db.list(`users/${this.auth.currentUserId}/course/`);
    this.courseObject = this.db.object(`users/${this.auth.currentUserId}/course/`);
    return this.courseObject;
  }
  getCourseList(){
    this.courseList = this.db.list(`users/${this.auth.currentUserId}/course/`);
    //this.courseList = this.db.object(`users/${this.auth.currentUserId}/course/`);
    return this.courseList;
  }
  setCourseId(id : number){
    this.selectedCourseId = id;
  }
  getCourseId(){
    //console.log(this.selectedCourseId);
    return this.selectedCourseId;
  }
  setCourseKey(key : string, group : string){
    this.selectedCourseKey = key;
    this.selectedGroup = group;
  }

  // INSERT UPDATE DELETE
  insertCourse(course : Course){
    this.db.object(`users/${this.auth.currentUserId}/course/${course.id}`).set({
      id: course.id,
      name : course.name,
      year : course.year,
      trimester : course.trimester,
      groupNo : course.group
    });

    if(course.group != 1){
      for(var i=1 ; i<=course.group ;i++){
        let groupName='group'+i;
        this.db.object(`users/${this.auth.currentUserId}/course/${course.id}/group/${groupName}`).set({
          id : groupName,
          name : 'Group '+i,
          img : 'pic'
        });
      }      
    }
      
  this.db.object(`users/${this.auth.currentUserId}/course/${course.id}/group/all`).set({
    id : 'all',
    name : 'All Group',
    img : 'pic'
  });
      
    
  }

  updateCourse(course : Course, courseID : number){
    this.db.object(`users/${this.auth.currentUserId}/course/${courseID}`).update({
      id: courseID,
      name : course.name,
      year : course.year,
      trimester : course.trimester,
      percentAtt : course.percentAtt
    });
  }

  deleteCourse(key : string){
    this.db.object(`users/${this.auth.currentUserId}/course/${key}`).remove();
  }

}
