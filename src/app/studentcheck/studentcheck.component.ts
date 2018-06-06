import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from "../shared/services/auth.service";
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-studentcheck',
  templateUrl: './studentcheck.component.html',
  styleUrls: ['./studentcheck.component.scss'],
  animations: [routerTransition()]
})
export class StudentcheckComponent implements OnInit {

  studentScoreForm: FormGroup;
  courseList: any;
  student : any;
  courseData : any;
  teachData : any;
  studentCourseData : any;
  showTableCourse;
  showTableStd;
  showTableData;

  score : any;
  constructor(
    private db: AngularFireDatabase,
    private auth: AuthService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.buildForm();
    this.showTableCourse = false;
    this.showTableStd = false;
    this.showTableData = false
  }

  onClick(){
    this.showTableCourse = false;
    this.showTableStd = false;
    this.showTableData = false;
    if(this.studentScoreForm.value.sid != '' && this.studentScoreForm.value.cid != ''){
      this.studentIden();
      this.showTableData = true;
    }else if(this.studentScoreForm.value.sid != ''){
      this.studentIden();
      this.showTableStd = true;
    }else if(this.studentScoreForm.value.cid != ''){
      this.courseIden();
      this.showTableCourse = true;
    }else{
      this.toastr.success("กรุณาป้อนรหัสวิชา หรือรหัสนักศึกษา");
    }
  }

  studentIden(){
    this.courseData = [];
    let temp = [];
    this.teachData = [];
    let sid = this.studentScoreForm.value.sid;
    this.db.list(`users/`).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(items => {
      for(var i=0; i<items.length; i++){
        this.courseData[i] = Object.keys(items[i].course)
          .map(key => Object.assign({ key }, items[i].course[key]));
        this.teachData[i] = items[i];
      }
      for(var i=0; i<this.courseData.length; i++){
        for(var j=0; j<this.courseData[i].length; j++){
          if(this.courseData[i][j].students != undefined){
            temp[j] = Object.keys(this.courseData[i][j].students)
              .map(key => Object.assign({ key }, 
                this.courseData[i][j].students[key]
              ));
              temp[j].push({course:this.courseData[i][j]});
              temp[j].push({profile:this.teachData[i]});
          }
        }
      }

      this.student = [];
      let k =0;
      for(var i=0; i<temp.length; i++){
        for(var j=0; j<temp[i].length; j++){
          if(temp[i][j].id == sid){
            this.student[k] = 
              [
                {std:temp[i][j]},
                {course:temp[i][temp[i].length-2].course},
                {profile:temp[i][temp[i].length-1].profile.profile}
              ]
            k++;
          }

        }
      }
      //console.log(this.student);
      if(this.studentScoreForm.value.cid != ''){
        this.studentCourseData = [];
        for(var i=0; i<this.student.length; i++){
          if(this.student[i][1].course.id == this.studentScoreForm.value.cid){
            this.studentCourseData = this.student[i];
            this.score = this.student[i][1].course;
          }
        }
      }
    });
    return this.student;
  }

  courseIden(){
    let temp = [];
    let cid = this.studentScoreForm.value.cid;
    this.courseList = [];
    this.db.list(`users/`).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(items => {
      for(var i=0; i< items.length; i++){
        if(items[i].course[cid]){
          this.courseList[i] = [{profile: items[i].profile},{course : items[i].course[cid]}];
        }
      }
    });
    return this.courseList;
  }

  something(course){
    this.score = course;
    console.log(this.score);
    this.showTableData = true;
  }

  onClickCourseCourse(something){
    let temp;
    this.student = [];
    let sid = this.studentScoreForm.value.sid;
    temp = Object.keys(something.students)
      .map(key => Object.assign({ key }, something.students[key]));
    for(var i=0; i<temp.length; i++){
      if(temp[i].id == sid){
        this.student[i] = [{attendance:temp[i].attendance},{quiz:temp[i].quiz}],{hw:temp[i].hw};
      }else{
        console.log('ไม่พบ Attendance/Quiz/Hw')
      }
    }
    console.log(this.student);
  }

  buildForm(): void {
    this.studentScoreForm = new FormGroup({
      cid: new FormControl('', [
        Validators.required,
        Validators.pattern("^[1-9]\\d{5}$")
       ]),
      sid: new FormControl('', [
        Validators.required,
        Validators.pattern("^[B|M|D]\\d{7}$")
      ]),
    });
  }

}
