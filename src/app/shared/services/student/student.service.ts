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
    this.db.object(`users/${this.auth.currentUserId}/course/${cid}/students/${student.id}`)
      .set({
        id: student.id,
        name : student.name,
        group : student.group
      });
  }

  deleteStudent(cid : number, id : string){
    this.db.object(`users/${this.auth.currentUserId}/course/${cid}/students/${id}`).remove();
  }
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  UpdateStudentscore(attendanceForm : Attendance, cid : number, iden : string,count:number,uncheck:boolean,countlate:number,countmiss:number,score:number,now:any,status:string){
    var today = new Date();
    if(attendanceForm.type == "attendance"){
      this.db.object(`users/${this.auth.currentUserId}/course/${cid}/students/${attendanceForm.student_id}/${attendanceForm.type}/${iden}`)
        .update({
          score : score,
          status : status,
          date : now
        });
      this.db.object(`users/${this.auth.currentUserId}/course/${cid}/schedule/${attendanceForm.type}/${iden}`)
        .update({
          countonTime : count,
          countLate : countlate,
          countMiss : countmiss
        });
      this.db.object(`users/${this.auth.currentUserId}/course/${cid}/schedule/${attendanceForm.type}/${iden}/checked/${attendanceForm.student_id}`)
        .set({
          id : attendanceForm.student_id
        });
    }else{
      this.db.object(`users/${this.auth.currentUserId}/course/${cid}/students/${attendanceForm.student_id}/${attendanceForm.type}/${iden}`)
        .update({
          score : attendanceForm.score
        });
      if(uncheck){
        this.db.object(`users/${this.auth.currentUserId}/course/${cid}/schedule/${attendanceForm.type}/${iden}`)
          .update({
            count : count
          });
        this.db.object(`users/${this.auth.currentUserId}/course/${cid}/schedule/${attendanceForm.type}/${iden}/checked/${attendanceForm.student_id}`)
          .set({
            id : attendanceForm.student_id
          });
      }
    }
  }

}
