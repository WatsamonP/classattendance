import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { Student } from './student.model';
import { Attendance } from './attendance.model';
import { StringifyOptions } from 'querystring';
import { AuthService } from "../../../shared/services/auth.service";

@Injectable()
export class StudentService {

  selectedStudent: Student = new Student();
  selectedAttendance: Attendance = new Attendance();
  courseList: AngularFireObject<any>;
  selectedCourseId : number;
  selectedCourseKey : string;
  studentId: string;
  studentList: Student[];

  constructor(
    private db: AngularFireDatabase,
    private auth: AuthService) { }

  ngOnInit() {

  }

  // Null Variable ////////////////////////////////////////////////////////////////////////
  getStudentList(){
    this.courseList = this.db.object(`users/${this.auth.currentUserId}
                      /course/${this.getCourseId()}/students/${this.getStudentId()}`)
    return this.courseList;
  }

  // GETER SETER //////////////////////////////////////////////////////////////////////////
  setCourseId(id : number){
    this.selectedCourseId = id;
  }
  getCourseId(){
    return this.selectedCourseId;
  }
  setStudentId(id:string){
    this.studentId ; id;
  }
  getStudentId(){
    return this.studentId;
  }
  
  // Work ////////////////////////////////////////////////////////////////////////////////
  insertStudentCid(student : Student, cid : string){
    this.db.object(`users/${this.auth.currentUserId}/course/${cid}/group/group${student.group}/students/${student.id}`)
      .set({
        id: student.id,
        name : student.name,
        group : student.group
      });
    /////
    this.db.object(`users/${this.auth.currentUserId}/course/${cid}/students/${student.id}`)
      .set({
        id: student.id,
        name : student.name,
        group : student.group
      });
  }
  // Null Variable
  insertStudent(student : Student){
    this.getStudentList().set({
      id: student.id,
      name : student.name,
    });
  }

  deleteStudent(cid : number, id : string){
    this.db.object(`users/${this.auth.currentUserId}/course/${cid}/students/${id}`).remove();
  }
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  insertAttendance(attendanceForm : Attendance, cid : number, count : number){
    var today = new Date();
    this.db.object(`users/${this.auth.currentUserId}/course/${cid}/students/${attendanceForm.student_id}/${attendanceForm.type}/${count}`)
      .set({
        score : attendanceForm.score,
        date : today
      });
  }

}
