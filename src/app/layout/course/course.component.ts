import { Component, OnInit, Input, Inject, ViewChild, TemplateRef } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

import { AuthService } from "../../shared/services/auth.service";
import { CourseService } from "../../shared/services/course/course.service";
import { StudentService } from "../../shared/services/student/student.service";
import { ExcelService } from "../../shared/services/excel/excel.service";
import { Course } from '../../shared/services/course/course.model';
import { Student } from '../../shared/services/student/student.model';
import { Attendance } from '../../shared/services/student/attendance.model';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Router } from '@angular/router';
import { slideInDownAnimation } from '../animations';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { toArray } from 'rxjs/operator/toArray';
import { DYNAMIC_TYPE } from '@angular/compiler/src/output/output_ast';
import { Pipe, PipeTransform } from '@angular/core';
import { MessageService } from '../../shared/services/messageService';
import * as moment from 'moment';

@Component({
    selector: 'app-course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.scss'],
    animations: [routerTransition(), slideInDownAnimation],
})

export class CourseComponent implements OnInit {
  isSubmit = null;
  isSubmit2 = null;
  //Course
  courseList: Course[];
  courseId;
  courseName;
  groupId;
  someEvent;
  private selectedId: number;
  //Student
  studentForm: FormGroup;
  studentList: Student[];
  studentListArr: any;
  IsHidden= true;
  csvhidden= true;
  scorehidden = true;
  //
  //defaultTime = {hour: 23, minute: 0};
  count : 0;
  count_attendance = [];
  count_quiz = [];
  count_hw = [];
  count_lab = [];
  count_attendancesort = [];
  count_quizsort = [];
  count_hwsort = [];
  count_labsort = [];
  totalScoreQ: number;
  totalScoreH: number;
  totalScoreL: number;
  stdtotalScoreQ = [];
  stdtotalScoreH = [];
  stdtotalScoreL = [];
  editCourseForm : FormGroup;
  //
  attendanceForm: FormGroup;
  closeResult: string;
  scheduleAttendanceList : any;
  scheduleQuizList : any;
  scheduleHomeworkList : any;
  scheduleLabList : any;
  csv: string;
  x : any;
  y : any;
  percentFlag = false;
  totalStudentPercentA = [];
  totalStudentPercentQ = [];
  totalStudentPercentH = [];
  totalStudentPercentL = [];
  totalMissClass = [];
  showMissClass = {flag: false, name:"OFF"};
  showPercentageA= {flag: false, name:"OFF"};
  showPercentageQ= {flag: false, name:"OFF"};
  showPercentageH= {flag: false, name:"OFF"};
  showPercentageL= {flag: false, name:"OFF"};
  showGroup= {flag: false, name:"OFF"};
  scoreCase = {high: 5, med:4, low:2};
  btn_attendance = [];
  btn_quiz = [];
  btn_hw = [];
  btn_lab = [];
  radioSelected : 1;
  scheduleAttendanceSortList : any;
  scheduleQuizSortList : any;
  scheduleHomeworkSortList : any;
  scheduleLabSortList : any;
  groupList : any;
  years: any;
  yearsList: number[] = [];
  terms: number[] = [1,2,3];
  percentAtt: number;
  percentQuiz: number;
  percentHw: number;
  percentLab: number;
  openEditiTemplate : boolean = false;
  //
  defaultPagination: number;
  advancedPagination: number;
  paginationSize: number;
  disabledPagination: number;
  isDisabled: boolean;
  isExpandOptionA: boolean = false;
  isExpandOptionQ: boolean = false;
  isExpandOptionH: boolean = false;
  isExpandOptionL: boolean = false;
  tabid = "attendance";


  constructor(
    private auth: AuthService,
    private courseService: CourseService,
    private studentService: StudentService,
    private db: AngularFireDatabase,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private excelService: ExcelService,
    private _messageService: MessageService) {
  }

  toggleDisabled() {
    this.isDisabled = !this.isDisabled;
  }

  switchExpandOptionA(){
    this.isExpandOptionA = !this.isExpandOptionA;
    this.isExpandOptionQ = false;
    this.isExpandOptionH = false;
    this.isExpandOptionL = false;
  }
  switchExpandOptionQ(){
    this.isExpandOptionQ = !this.isExpandOptionQ;
    this.isExpandOptionA = false;
    this.isExpandOptionH = false;
    this.isExpandOptionL = false;
  }
  switchExpandOptionH(){
    this.isExpandOptionH = !this.isExpandOptionH;
    this.isExpandOptionA = false;
    this.isExpandOptionQ = false;
    this.isExpandOptionL = false;
  }
  switchExpandOptionL(){
    this.isExpandOptionL = !this.isExpandOptionL;
    this.isExpandOptionA = false;
    this.isExpandOptionQ = false;
    this.isExpandOptionH = false;
  }

  test(){
    this.tabid = "attendance";
  }
  test2(){
    this.tabid = "quiz";
  }
  test3(){
    this.tabid = "homework";
  }
  test4(){
    this.tabid = "lab";
  }

  @ViewChild('editCourse')
    private myEditCourse: TemplateRef<any>;

  ngOnInit() {
    this._messageService.listen().subscribe((m:any) => {
      //console.log(m);
      this.onFilterClick(m);
    })

    // set course ID จาก route
    //let id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.route.paramMap.subscribe((params: ParamMap) => {
      let id = parseInt(params.get('id'));
      let group = params.get('group').toString();
      let someEvent = params.get('someEvent');

      this.courseId = id;
      this.groupId = group;
      this.someEvent = someEvent;
      this.openEditiTemplate = false;
      this.showMissClass.flag = false;
      this.showMissClass.name = "OFF";
      this.showPercentageA.flag = false;
      this.showPercentageA.name = "OFF";
      this.showPercentageQ.flag = false;
      this.showPercentageQ.name = "OFF";
      this.showPercentageH.flag = false;
      this.showPercentageH.name = "OFF";
      this.showPercentageL.flag = false;
      this.showPercentageL.name = "OFF";


      //Query Course
      this.db.list(`users/${this.auth.currentUserId}/course/`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(items => {
          this.courseList = items;
          //console.log(items)
          for(var i=0; i<this.courseList.length; i++){
            if(this.courseList[i].id == this.courseId ){
              this.groupList = Object.keys(this.courseList[i].group)
                .map(key => Object.assign({ key }, this.courseList[i].group[key]));
              this.percentAtt = this.courseList[i].percentAtt;
              this.percentQuiz = this.courseList[i].percentQuiz;
              this.percentHw = this.courseList[i].percentHw;
              this.percentLab = this.courseList[i].percentLab;
              this.courseName = this.courseList[i].name;
            }
          }
            return items.map(item => item.key);
        });

      // iden Quert ///////////////////////////////////////////
      if(this.groupId != 'all'){
        // For a Group  /////////////////////////////////////////////
        // 1. Query scheduleAttendanceList
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/schedule/attendance`).snapshotChanges().map(actions => {
          return actions.map(action => ({ key: action.key, ...action.payload.val() }));
          }).subscribe(items => {
            this.scheduleAttendanceList = items;
            this.btn_attendance =[];
            for(var i=0 ; i<this.scheduleAttendanceList.length ;i++){
                if(i%5==0)
                  this.btn_attendance.push({id:i+5,name: (i+1)+'-'+(i+5)});
            }
            let sdtLen =  this.scheduleAttendanceList.length;
            this.scheduleAttendanceSortList = [];
            var i=0;
            var count=0;
            for (sdtLen; sdtLen > i; i++) {
              count++;
              this.scheduleAttendanceSortList[i] = [{data: this.scheduleAttendanceList[i]},{index : i+1}];
              if(count==5){
                break;
              }
            };
            return items.map(item => item.key);
        });

        // 2. Query Quiz
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/schedule/quiz`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(items => {
          this.scheduleQuizList = items;
          this.btn_quiz =[];
          this.totalScoreQ = 0;
          for(var i=0 ; i<this.scheduleQuizList.length ;i++){
              this.totalScoreQ = this.totalScoreQ + Number(this.scheduleQuizList[i].totalScore);
              if(i%5==0)
                this.btn_quiz.push({id:i+5,name: (i+1)+'-'+(i+5)});
          }
          let sdtLen =  this.scheduleQuizList.length;
          this.scheduleQuizSortList = [];
          var i=0;
          var count=0;
          for (sdtLen; sdtLen > i; i++) {
            count++;
            this.scheduleQuizSortList[i] = [{data: this.scheduleQuizList[i]},{index : i+1}];
            if(count==5){
              break;
            }
          };
            return items.map(item => item.key);
        });

        // 3. Query Homwork
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/schedule/hw`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(items => {
          this.scheduleHomeworkList = items;
          this.btn_hw =[];
          this.totalScoreH = 0;
          for(var i=0 ; i<this.scheduleHomeworkList.length ;i++){
              this.totalScoreH = this.totalScoreH + Number(this.scheduleHomeworkList[i].totalScore);
              if(i%5==0)
                this.btn_hw.push({id:i+5,name: (i+1)+'-'+(i+5)});
          }
          let sdtLen =  this.scheduleHomeworkList.length;
          this.scheduleHomeworkSortList = [];
          var i=0;
          var count=0;
          for (sdtLen; sdtLen > i; i++) {
            count++;
            this.scheduleHomeworkSortList[i] = [{data: this.scheduleHomeworkList[i]},{index : i+1}];
            if(count==5){
              break;
            }
          };
            return items.map(item => item.key);
        });
        // 3. Query Lab
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/schedule/lab`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(items => {
          this.scheduleLabList = items;
          this.btn_lab =[];
          this.totalScoreL = 0;
          for(var i=0 ; i<this.scheduleLabList.length ;i++){
              this.totalScoreL = this.totalScoreL + Number(this.scheduleLabList[i].totalScore);
              if(i%5==0)
                this.btn_lab.push({id:i+5,name: (i+1)+'-'+(i+5)});
          }

          let sdtLen =  this.scheduleLabList.length;
          this.scheduleLabSortList = [];
          var i=0;
          var count=0;
          for (sdtLen; sdtLen > i; i++) {
            count++;
            this.scheduleLabSortList[i] = [{data: this.scheduleLabList[i]},{index : i+1}];
            if(count==5){
              break;
            }
          };
            return items.map(item => item.key);
        });
        // student
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/students`).snapshotChanges().map(actions => {
          return actions.map(action => ({ key: action.key, ...action.payload.val() }));
          }).subscribe(items => {
          this.studentList = items;
          let temp = [];
          for(var i=0; i<this.studentList.length ;i++){
            if(this.studentList[i].group == this.groupId){
              temp.push(this.studentList[i]);
              continue;
            }
          }
          this.stdtotalScoreQ = [];
          this.stdtotalScoreH = [];
          this.stdtotalScoreL = [];
          for(var i=0; i<temp.length ;i++){
            var temp2 = 0;
            for(var k=0; k<this.scheduleQuizList.length; k++){
              if(temp[i].quiz[this.scheduleQuizList[k].id])
                temp2 = temp2 + temp[i].quiz[this.scheduleQuizList[k].id].score;
            }
            this.stdtotalScoreQ[i] = temp2;
          }
          for(var i=0; i<temp.length ;i++){
            var temp2 = 0;
            for(var k=0; k<this.scheduleHomeworkList.length; k++){
              if(temp[i].hw[this.scheduleHomeworkList[k].id])
                temp2 = temp2 + temp[i].hw[this.scheduleHomeworkList[k].id].score;
            }
            this.stdtotalScoreH[i] = temp2;
          }
          for(var i=0; i<temp.length ;i++){
            var temp2 = 0;
            for(var k=0; k<this.scheduleLabList.length; k++){
              if(temp[i].lab[this.scheduleLabList[k].id])
              temp2 = temp2 + temp[i].lab[this.scheduleLabList[k].id].score;
            }
            this.stdtotalScoreL[i] = temp2;
          }
          let ontime,late,miss,leave;
          this.count_attendance = [];


          for(var j=0; j<this.scheduleAttendanceList.length; j++){
            ontime=0,late=0,miss=0,leave=0;
            for(var k=0; k<items.length; k++){
              if(items[k].attendance[this.scheduleAttendanceList[j].id]){
              if(items[k].attendance[this.scheduleAttendanceList[j].id].status == "onTime")
                ontime++;
              else if(items[k].attendance[this.scheduleAttendanceList[j].id].status == "Late")
                late++;
              else if(items[k].attendance[this.scheduleAttendanceList[j].id].status == "Leave")
                leave++;
              else if(items[k].attendance[this.scheduleAttendanceList[j].id].status == "Missed Class")
                miss++;
              }
            }
            this.count_attendance.push({all: ontime+late+leave,ontime: ontime,late:late,leave:leave,miss:miss});
          }

          for(var j=0; j<this.scheduleQuizList.length; j++){
            this.count_quiz[j] = 0;
            for(var k=0; k<temp.length; k++){
              if(temp[k].quiz[this.scheduleQuizList[j].id])
                if(temp[k].quiz[this.scheduleQuizList[j].id].score != 0)
                  this.count_quiz[j]++;
            }
          }
          for(var j=0; j<this.scheduleHomeworkList.length; j++){
            this.count_hw[j] = 0;
            for(var k=0; k<temp.length; k++){
              if(temp[k].hw[this.scheduleHomeworkList[j].id])
                if(temp[k].hw[this.scheduleHomeworkList[j].id].score != 0)
                  this.count_hw[j]++;
            }
          }
          for(var j=0; j<this.scheduleLabList.length; j++){
            this.count_lab[j] = 0;
            for(var k=0; k<temp.length; k++){
              if(temp[k].lab[this.scheduleLabList[j].id])
                if(temp[k].lab[this.scheduleLabList[j].id].score != 0)
                  this.count_lab[j]++;
            }
          }
          this.count_attendancesort = [];
          var i=0;
          var count=0;
          for (this.scheduleAttendanceList.length; this.scheduleAttendanceList.length > i; i++) {
            count++;
            this.count_attendancesort[i] = this.count_attendance[i];
            if(count==5){
              break;
            }
          };
          this.count_quizsort = [];
          i=0;
          count=0;
          for (this.scheduleQuizList.length; this.scheduleQuizList.length > i; i++) {
            count++;
            this.count_quizsort[i] = this.count_quiz[i];
            if(count==5){
              break;
            }
          };
          this.count_hwsort = [];
          i=0;
          count=0;
          for (this.scheduleHomeworkList.length; this.scheduleHomeworkList.length > i; i++) {
            count++;
            this.count_hwsort[i] = this.count_hw[i];
            if(count==5){
              break;
            }
          };
          this.count_labsort = [];
          i=0;
          count=0;
          for (this.scheduleLabList.length; this.scheduleLabList.length > i; i++) {
            count++;
            this.count_labsort[i] = this.count_lab[i];
            if(count==5){
              break;
            }
          };
          this.studentListArr = Object.keys(temp)
            .map(key => Object.assign({ key }, temp[key]));
            return items.map(item => item.key);
        });

      }else{
        // For All Group  /////////////////////////////////////////////
        // 1. Query scheduleAttendanceList
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/schedule/attendance`).snapshotChanges().map(actions => {
          return actions.map(action => ({ key: action.key, ...action.payload.val() }));
          }).subscribe(items => {
            this.scheduleAttendanceList = items;
            this.btn_attendance =[];
            for(var i=0 ; i<this.scheduleAttendanceList.length ;i++){
                if(i%5==0)
                  this.btn_attendance.push({id:i+5,name: (i+1)+'-'+(i+5)});
            }
            let sdtLen =  this.scheduleAttendanceList.length;
            this.scheduleAttendanceSortList = [];
            var i=0;
            var count=0;
            for (sdtLen; sdtLen > i; i++) {
              count++;
              this.scheduleAttendanceSortList[i] = [{data: this.scheduleAttendanceList[i]},{index : i+1}];
              if(count==5){
                break;
              }
            };
            //console.log(this.scheduleAttendanceList);
            return items.map(item => item.key);
        });

        // 2. Query Quiz
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/schedule/quiz`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(items => {
          this.scheduleQuizList = items;
          this.btn_quiz =[];
          this.totalScoreQ = 0;
          for(var i=0 ; i<this.scheduleQuizList.length ;i++){
              this.totalScoreQ = this.totalScoreQ + Number(this.scheduleQuizList[i].totalScore);
              if(i%5==0)
                this.btn_quiz.push({id:i+5,name: (i+1)+'-'+(i+5)});
          }

          let sdtLen =  this.scheduleQuizList.length;
          this.scheduleQuizSortList = [];
          var i=0;
          var count=0;
          for (sdtLen; sdtLen > i; i++) {
            count++;
            this.scheduleQuizSortList[i] = [{data: this.scheduleQuizList[i]},{index : i+1}];
            if(count==5){
              break;
            }
          };
            return items.map(item => item.key);
        });

        // 3. Query Homwork
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/schedule/hw`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(items => {
          this.scheduleHomeworkList = items;
          this.btn_hw =[];
          this.totalScoreH = 0;
          for(var i=0 ; i<this.scheduleHomeworkList.length ;i++){
              this.totalScoreH = this.totalScoreH + Number(this.scheduleHomeworkList[i].totalScore);
              if(i%5==0)
                this.btn_hw.push({id:i+5,name: (i+1)+'-'+(i+5)});
          }

          let sdtLen =  this.scheduleHomeworkList.length;
          this.scheduleHomeworkSortList = [];
          var i=0;
          var count=0;
          for (sdtLen; sdtLen > i; i++) {
            count++;
            this.scheduleHomeworkSortList[i] = [{data: this.scheduleHomeworkList[i]},{index : i+1}];
            if(count==5){
              break;
            }
          };
            return items.map(item => item.key);
        });
        // 3. Query Lab
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/schedule/lab`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(items => {
          this.scheduleLabList = items;
          this.btn_lab =[];
          this.totalScoreL = 0;
          for(var i=0 ; i<this.scheduleLabList.length ;i++){
              this.totalScoreL = this.totalScoreL + Number(this.scheduleLabList[i].totalScore);
              if(i%5==0)
                this.btn_lab.push({id:i+5,name: (i+1)+'-'+(i+5)});
          }

          let sdtLen =  this.scheduleLabList.length;
          this.scheduleLabSortList = [];
          var i=0;
          var count=0;
          for (sdtLen; sdtLen > i; i++) {
            count++;
            this.scheduleLabSortList[i] = [{data: this.scheduleLabList[i]},{index : i+1}];
            if(count==5){
              break;
            }
          };
            return items.map(item => item.key);
        });
        //Query Student
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/students`).snapshotChanges().map(actions => {
          return actions.map(action => ({ key: action.key, ...action.payload.val() }));
          }).subscribe(items => {
          this.studentList = items;
          let temp = [];
          temp = items;
          this.stdtotalScoreQ = [];
          this.stdtotalScoreH = [];
          this.stdtotalScoreL = [];
          for(var i=0; i<temp.length ;i++){
            var temp2 = 0;
            for(var k=0; k<this.scheduleQuizList.length; k++){
              if(temp[i].quiz[this.scheduleQuizList[k].id])
                temp2 = temp2 + temp[i].quiz[this.scheduleQuizList[k].id].score;
            }
            this.stdtotalScoreQ[i] = temp2;
          }
          for(var i=0; i<temp.length ;i++){
            var temp2 = 0;
            for(var k=0; k<this.scheduleHomeworkList.length; k++){
              if(temp[i].hw[this.scheduleHomeworkList[k].id])
                temp2 = temp2 + temp[i].hw[this.scheduleHomeworkList[k].id].score;
            }
            this.stdtotalScoreH[i] = temp2;
          }
          for(var i=0; i<temp.length ;i++){
            var temp2 = 0;
            for(var k=0; k<this.scheduleLabList.length; k++){
              if(temp[i].lab[this.scheduleLabList[k].id])
              temp2 = temp2 + temp[i].lab[this.scheduleLabList[k].id].score;
            }
            this.stdtotalScoreL[i] = temp2;
          }
          let ontime,late,miss,leave;
          this.count_attendance = [];


          for(var j=0; j<this.scheduleAttendanceList.length; j++){
            ontime=0,late=0,miss=0,leave=0;
            for(var k=0; k<items.length; k++){
              if(items[k].attendance[this.scheduleAttendanceList[j].id]){
              if(items[k].attendance[this.scheduleAttendanceList[j].id].status == "onTime")
                ontime++;
              else if(items[k].attendance[this.scheduleAttendanceList[j].id].status == "Late")
                late++;
              else if(items[k].attendance[this.scheduleAttendanceList[j].id].status == "Leave")
                leave++;
              else if(items[k].attendance[this.scheduleAttendanceList[j].id].status == "Missed Class")
                miss++;
              }
            }
            this.count_attendance.push({all: ontime+late+leave,ontime: ontime,late:late,leave:leave,miss:miss});
          }

          for(var j=0; j<this.scheduleQuizList.length; j++){
            this.count_quiz[j] = 0;
            for(var k=0; k<temp.length; k++){
              if(temp[k].quiz[this.scheduleQuizList[j].id])
                if(temp[k].quiz[this.scheduleQuizList[j].id].score != 0)
                  this.count_quiz[j]++;
            }
          }
          for(var j=0; j<this.scheduleHomeworkList.length; j++){
            this.count_hw[j] = 0;
            for(var k=0; k<temp.length; k++){
              if(temp[k].hw[this.scheduleHomeworkList[j].id])
                if(temp[k].hw[this.scheduleHomeworkList[j].id].score != 0)
                  this.count_hw[j]++;
            }
          }
          for(var j=0; j<this.scheduleLabList.length; j++){
            this.count_lab[j] = 0;
            for(var k=0; k<temp.length; k++){
              if(temp[k].lab[this.scheduleLabList[j].id])
                if(temp[k].lab[this.scheduleLabList[j].id].score != 0)
                  this.count_lab[j]++;
            }
          }
          this.count_attendancesort = [];
          var i=0;
          var count=0;
          for (this.scheduleAttendanceList.length; this.scheduleAttendanceList.length > i; i++) {
            count++;
            this.count_attendancesort[i] = this.count_attendance[i];
            if(count==5){
              break;
            }
          };
          this.count_quizsort = [];
          i=0;
          count=0;
          for (this.scheduleQuizList.length; this.scheduleQuizList.length > i; i++) {
            count++;
            this.count_quizsort[i] = this.count_quiz[i];
            if(count==5){
              break;
            }
          };
          this.count_hwsort = [];
          i=0;
          count=0;
          for (this.scheduleHomeworkList.length; this.scheduleHomeworkList.length > i; i++) {
            count++;
            this.count_hwsort[i] = this.count_hw[i];
            if(count==5){
              break;
            }
          };
          this.count_labsort = [];
          i=0;
          count=0;
          for (this.scheduleLabList.length; this.scheduleLabList.length > i; i++) {
            count++;
            this.count_labsort[i] = this.count_lab[i];
            if(count==5){
              break;
            }
          };
          this.studentListArr = Object.keys(items).map(key => Object.assign({ key }, items[key]));
          //console.log(this.studentListArr)
            return items.map(item => item.key);
        });
      } //End All Group
    });
    // buildForm for Student /////////////////////////////////////////////////////////////
    this.buildForm();
    //setyearlist
    this.years = new Date().getFullYear() + 543;
    for (var i = 0; i < 5; i++) {
        this.yearsList.push(this.years-i)
    };

  }


  onFilterClick(event) {
    //console.log(event);
    if(event.todo == 'delete'){
      this.onDelete(event.fn);
    }else if(event.todo == 'std_keyboard'){
      this.onSwitch();
    }else if(event.todo == 'std_csv'){
      this.onSwitchcsv();
    }else if(event.todo == 'std_score'){
      this.onSwitchscore();
    }else if(event.todo == 'edit'){
      this.openOnEdit(this.myEditCourse)
      this.openEditiTemplate = true;
      //this.openOnEdit();
    }else if(event.todo == 'export'){
      this.exportToExcel();
    }
    //
    //this.onSwitch();
  }

  radioCheckA(id){
    let sdtLen =  this.scheduleAttendanceList.length;
    this.scheduleAttendanceSortList = [];
    this.count_attendancesort = [];
    //console.log(id-5);
    var i= id-5;
    var j=0;
    for (id ; id > i; i++) {
      if(this.scheduleAttendanceList[i] != undefined){
        this.scheduleAttendanceSortList[j] = [{data: this.scheduleAttendanceList[i]},{index : i+1}];
        this.count_attendancesort[j] = this.count_attendance[i];
        j++;
      }
    };
    //console.log(this.scheduleAttendanceSortList);
  }
  radioCheckQ(id){
    let sdtLen =  this.scheduleQuizList.length;
    this.scheduleQuizSortList = [];
    this.count_quizsort = [];
    //console.log(id-5);
    var i= id-5;
    var j=0;
    for (id ; id > i; i++) {
      if(this.scheduleQuizList[i] != undefined){
        this.scheduleQuizSortList[j] = [{data: this.scheduleQuizList[i]},{index : i+1}];
        this.count_quizsort[j] = this.count_quiz[i];
        j++;
      }
    };
  }
  radioCheckH(id){
    let sdtLen =  this.scheduleHomeworkList.length;
    this.scheduleHomeworkSortList = [];
    this.count_hwsort = [];
    //console.log(id-5);
    var i= id-5;
    var j=0;
    for (id ; id > i; i++) {
      if(this.scheduleHomeworkList[i] != undefined){
        this.scheduleHomeworkSortList[j] = [{data: this.scheduleHomeworkList[i]},{index : i+1}];
        this.count_hwsort[j] = this.count_hw[i];
        j++;
      }
    };
    //console.log(this.scheduleHomeworkSortList);
  }
  radioCheckL(id){
    let sdtLen =  this.scheduleLabList.length;
    this.scheduleLabSortList = [];
    this.count_labsort = [];
    //console.log(id-5);
    var i= id-5;
    var j=0;
    for (id ; id > i; i++) {
      if(this.scheduleLabList[i] != undefined){
        this.scheduleLabSortList[j] = [{data: this.scheduleLabList[i]},{index : i+1}];
        this.count_labsort[j] = this.count_lab[i];
        j++;
      }
    };
    //console.log(this.scheduleLabSortList);
  }

  findPercentageA(percent : Number){
    let schedule,score,temp,temp2,fullScore;
    if(this.scheduleAttendanceList.length==0){
      //console.log('ZERO')
    }else{

      for(var i=0; i<this.studentListArr.length ; i++){
        temp = 0;
        fullScore = 0;
        for(var j=0; j<this.scheduleAttendanceList.length ; j++){
          schedule = this.scheduleAttendanceList[j].key;
          score = this.studentListArr[i].attendance[schedule].score;
          fullScore = fullScore + Number(this.scheduleAttendanceList[j].onTimeScore);
          temp = temp + score;
        }
        this.totalStudentPercentA.push(Number(temp)*Number(percent)/Number(fullScore));
        this.studentListArr = Object.keys(this.studentListArr)
        .map(key => Object.assign({ key }, this.studentListArr[key], {percent:this.totalStudentPercentA[key]}));

      }
    }
  }

  findPercentageQ(percent : Number){
    let schedule,score,temp,temp2,fullScore;
    if(this.scheduleQuizList.length==0){
      //console.log('ZERO')
    }else{

      for(var i=0; i<this.studentListArr.length ; i++){
        temp = 0;
        fullScore = 0;
        for(var j=0; j<this.scheduleQuizList.length ; j++){
          schedule = this.scheduleQuizList[j].key;
          score = this.studentListArr[i].quiz[schedule].score;
          fullScore = fullScore + Number(this.scheduleQuizList[j].totalScore);
          temp = temp + score;
        }
        this.totalStudentPercentQ.push(Number(temp)*Number(percent)/Number(fullScore));
        this.studentListArr = Object.keys(this.studentListArr)
        .map(key => Object.assign({ key }, this.studentListArr[key], {percent:this.totalStudentPercentQ[key]}));

      }
    }
  }

  findPercentageH(percent : Number){
    let schedule,score,temp,temp2,fullScore;
    if(this.scheduleHomeworkList.length==0){
      //console.log('ZERO')
    }else{

      for(var i=0; i<this.studentListArr.length ; i++){
        temp = 0;
        fullScore = 0;
        for(var j=0; j<this.scheduleHomeworkList.length ; j++){
          schedule = this.scheduleHomeworkList[j].key;
          score = this.studentListArr[i].hw[schedule].score;
          fullScore = fullScore + Number(this.scheduleHomeworkList[j].totalScore);
          temp = temp + score;
        }
        this.totalStudentPercentH.push(Number(temp)*Number(percent)/Number(fullScore));
        this.studentListArr = Object.keys(this.studentListArr)
        .map(key => Object.assign({ key }, this.studentListArr[key], {percent:this.totalStudentPercentH[key]}));

      }
    }
  }
  findPercentageL(percent : Number){
    let schedule,score,temp,temp2,fullScore;
    if(this.scheduleLabList.length==0){
      //console.log('ZERO')
    }else{

      for(var i=0; i<this.studentListArr.length ; i++){
        temp = 0;
        fullScore = 0;
        for(var j=0; j<this.scheduleLabList.length ; j++){
          schedule = this.scheduleLabList[j].key;
          score = this.studentListArr[i].lab[schedule].score;
          fullScore = fullScore + Number(this.scheduleLabList[j].totalScore);
          temp = temp + score;
        }
        this.totalStudentPercentL.push(Number(temp)*Number(percent)/Number(fullScore));
        this.studentListArr = Object.keys(this.studentListArr)
        .map(key => Object.assign({ key }, this.studentListArr[key], {percent:this.totalStudentPercentL[key]}));

      }
      //console.log(this.totalStudentPercentL)
    }
  }

  findMissClassNumber(){
    let schedule,score,temp,temp2;
    if(this.scheduleAttendanceList.length==0){
      //console.log('ZERO')
    }else{
      for(var i=0; i<this.studentListArr.length ; i++){
        temp = 0;
        for(var j=0; j<this.scheduleAttendanceList.length ; j++){
          schedule = this.scheduleAttendanceList[j].key;
          if(this.studentListArr[i].attendance[schedule].status == 'Missed Class'){
            temp = temp + 1;
          }
        }
        this.totalMissClass.push(temp);
        this.studentListArr = Object.keys(this.studentListArr)
        .map(key => Object.assign({ key }, this.studentListArr[key], {totalMiss:this.totalMissClass[key]}));
      }
    }
    //console.log(this.studentListArr);
  }

  // Button

  onEditCourse() {
    if(this.editCourseForm.value.percentAtt == undefined)
      this.editCourseForm.patchValue({percentAtt : 0});
    if(this.editCourseForm.value.percentQuiz == undefined)
      this.editCourseForm.patchValue({percentQuiz : 0});
    if(this.editCourseForm.value.percentHw == undefined)
      this.editCourseForm.patchValue({percentHw : 0});
    if(this.editCourseForm.value.percentLab == undefined)
      this.editCourseForm.patchValue({percentLab : 0});
    console.log(this.editCourseForm.value)
    this.courseService.updateCourse(this.editCourseForm.value,this.courseId);
    this.toastr.success("แก้ไข"+this.courseId
      +" : "+ this.editCourseForm.value.name+" สำเร็จ");
  }

  onDelete(id: string) {
    if (confirm('Are you sure to delete this record ?') == true) {
      this.courseService.deleteCourse(id);
      this.toastr.success("Deleted Successfully");
    }
  }
  //Validators
  get id() {
     return this.studentForm.get('id');
  }
  get name() {
    return this.studentForm.get('name');
  }
  get group() {
    return this.studentForm.get('group');
  }
  get student_id() {
     return this.attendanceForm.get('student_id');
  }
  get time() {
     return this.attendanceForm.get('time');
  }
  // buildForm for Student /////////////////////////////////////////////////////////////

  buildForm(): void {
    this.studentForm = new FormGroup({
      id: new FormControl('', [
        Validators.required,
        Validators.pattern("^[B|M|D]\\d{7}$")
      ]),
      name: new FormControl('', [
        Validators.required
      ]),
      group: new FormControl('', [
        Validators.required
      ]),
    });
    //
    this.attendanceForm = new FormGroup({
      student_id: new FormControl('', [
        Validators.required,
        Validators.pattern("^[B|M|D]\\d{7}$")
      ]),
      type: new FormControl('', []),
      time: new FormControl('',  [
        Validators.required,
        Validators.pattern("^[0-9]+$")
      ]),
      score: new FormControl(0,  [])
    });
    this.editCourseForm = new FormGroup({
      name: new FormControl('', []),
      year: new FormControl('', []),
      trimester: new FormControl('', []),
      percentAtt: new FormControl(0, []),
      percentQuiz: new FormControl(0, []),
      percentHw: new FormControl(0, []),
      percentLab: new FormControl(0, []),
    });
  }

  createStudent(cid : string, course){
    this.isSubmit = true;
    if (this.studentForm.invalid) {
        return;
    }
    if(this.studentForm.value.group <= course.groupNo){
      this.studentService.insertStudentCid(this.studentForm.value,cid);
      this.toastr.success("Add Successfully");
    }else{
      this.toastr.warning("ไม่มีกลุ่มเรียนนี้");
    }
  }

  onDeleteStudent(id: string) {
    if (confirm('Are you sure to delete this record ?') == true) {
      this.studentService.deleteStudent(this.courseId,id);
      this.toastr.success("Deleted Successfully");
    }
  }

  onUpdatestdscore(){
    this.isSubmit2 = true;
    if (this.attendanceForm.invalid) {
        return;
    }
    this.isSubmit2 = null;
    var check = [],acheck = false;
    var iden,uncheck = true, stdid = this.attendanceForm.value.student_id ,update = false;
    var count,status,score,countmiss,countlate;
    let currentDay = moment().format();
    if(this.attendanceForm.value.type == "attendance"){
      if(this.attendanceForm.value.time > this.scheduleAttendanceList.length){
        this.toastr.warning("ไม่มี Attendance ครั้งที่ "+ this.attendanceForm.value.time);
      }else{
        iden = this.scheduleAttendanceList[this.attendanceForm.value.time-1].id;
        if(this.scheduleAttendanceList[this.attendanceForm.value.time-1].checked){
          check = Object.keys(this.scheduleAttendanceList[this.attendanceForm.value.time-1].checked)
          .map(key => Object.assign({ key }, this.scheduleAttendanceList[this.attendanceForm.value.time-1].checked[key]));
          for(var i=0; i<check.length; i++){
            if(check[i].id == stdid){
              acheck = true;
              break;
            }
          }
        }
        if(acheck){
          this.toastr.warning("เช็คชื่อนักศึกษาคนนี้แล้ว");
        }else if(currentDay.toString() < this.scheduleAttendanceList[this.attendanceForm.value.time-1].lateTime.toString()){
          status = "onTime";
          score = this.scheduleAttendanceList[this.attendanceForm.value.time-1].onTimeScore;
          count = this.scheduleAttendanceList[this.attendanceForm.value.time-1].countOnTime+1;
          countlate = this.scheduleAttendanceList[this.attendanceForm.value.time-1].countLate;
          countmiss = this.scheduleAttendanceList[this.attendanceForm.value.time-1].countMiss-1;
          update = true;
        }else{
          status = "Late";
          score = this.scheduleAttendanceList[this.attendanceForm.value.time-1].lateScore;
          count = this.scheduleAttendanceList[this.attendanceForm.value.time-1].countOnTime;
          countlate = this.scheduleAttendanceList[this.attendanceForm.value.time-1].countLate+1;
          countmiss = this.scheduleAttendanceList[this.attendanceForm.value.time-1].countMiss-1;
          update = true;
        }
      }


    }else if(this.attendanceForm.value.type == "quiz"){
      if(this.attendanceForm.value.time > this.scheduleQuizList.length){
        this.toastr.warning("ไม่มี Quiz ครั้งที่ "+ this.attendanceForm.value.time);
      }else if(this.scheduleQuizList[this.attendanceForm.value.time-1].totalScore >= this.attendanceForm.value.score &&
      this.scheduleQuizList[this.attendanceForm.value.time-1].totalScore >= 0){
          iden = this.scheduleQuizList[this.attendanceForm.value.time-1].id;
          count = this.scheduleQuizList[this.attendanceForm.value.time-1].count+1;
          if(this.scheduleQuizList[this.attendanceForm.value.time-1].checked){
            check = Object.keys(this.scheduleQuizList[this.attendanceForm.value.time-1].checked)
            .map(key => Object.assign({ key }, this.scheduleQuizList[this.attendanceForm.value.time-1].checked[key]));
            for(var i=0; i<check.length; i++){
              if(check[i].id == stdid){
                count = this.scheduleQuizList[this.attendanceForm.value.time-1].count;
                uncheck = false;
                break;
              }
            }
          }
          update = true;
      }else{
        this.toastr.warning("กรุณาป้อนคะแนนให้ไม่เกินคะแนนเต็ม");
      }
    }else if(this.attendanceForm.value.type == "hw"){
      if(this.attendanceForm.value.time > this.scheduleHomeworkList.length){
        this.toastr.warning("ไม่มี Homework ครั้งที่ "+ this.attendanceForm.value.time);
      }else if(this.scheduleHomeworkList[this.attendanceForm.value.time-1].totalScore >= this.attendanceForm.value.score &&
      this.scheduleHomeworkList[this.attendanceForm.value.time-1].totalScore >= 0){
        iden = this.scheduleHomeworkList[this.attendanceForm.value.time-1].id;
        count = this.scheduleHomeworkList[this.attendanceForm.value.time-1].count+1;
        if(this.scheduleHomeworkList[this.attendanceForm.value.time-1].checked){
          check = Object.keys(this.scheduleHomeworkList[this.attendanceForm.value.time-1].checked)
          .map(key => Object.assign({ key }, this.scheduleHomeworkList[this.attendanceForm.value.time-1].checked[key]));
          for(var i=0; i<check.length; i++){
            if(check[i].id == stdid){
              count = this.scheduleHomeworkList[this.attendanceForm.value.time-1].count;
              uncheck = false;
              break;
            }
          }
        }
        update = true;
      }else{
        this.toastr.warning("กรุณาป้อนคะแนนให้ไม่เกินคะแนนเต็ม");
      }
    }else if(this.attendanceForm.value.type == "lab"){
      if(this.attendanceForm.value.time > this.scheduleLabList.length){
        this.toastr.warning("ไม่มี Lab ครั้งที่ "+ this.attendanceForm.value.time);
      }else if(this.scheduleLabList[this.attendanceForm.value.time-1].totalScore >= this.attendanceForm.value.score &&
      this.scheduleLabList[this.attendanceForm.value.time-1].totalScore >= 0){
        iden = this.scheduleLabList[this.attendanceForm.value.time-1].id;
        count = this.scheduleLabList[this.attendanceForm.value.time-1].count+1;
        if(this.scheduleLabList[this.attendanceForm.value.time-1].checked){
          check = Object.keys(this.scheduleLabList[this.attendanceForm.value.time-1].checked)
          .map(key => Object.assign({ key }, this.scheduleLabList[this.attendanceForm.value.time-1].checked[key]));
          for(var i=0; i<check.length; i++){
            if(check[i].id == stdid){
              count = this.scheduleLabList[this.attendanceForm.value.time-1].count;
              uncheck = false;
              break;
            }
          }
        }
        update = true;
      }else{
        this.toastr.warning("กรุณาป้อนคะแนนให้ไม่เกินคะแนนเต็ม");
      }
    }
    if(update){
      this.studentService.UpdateStudentscore(this.attendanceForm.value,this.courseId,iden,count,uncheck,countlate,countmiss,score,currentDay,status);
      this.toastr.success("บันทึกคะแนนเรียบร้อย");
    }
  }
  ///////////////////////////////////////////////////
  onSwitch(){
    this.IsHidden= !this.IsHidden;
  }
  onSwitchcsv(){
    this.csvhidden= !this.csvhidden;
  }
  onSwitchscore(){
    this.scorehidden= !this.scorehidden;
  }
  onSwitchShowPercentA(percent){
    if(percent != undefined){
      this.showPercentageA.flag= !this.showPercentageA.flag;
      if(this.showPercentageA.flag){
        this.showPercentageA.name = "ON";
        this.totalStudentPercentA = [];
        this.showPercentageQ.flag = false;
        this.showPercentageQ.name = "OFF";
        this.showPercentageH.flag = false;
        this.showPercentageH.name = "OFF";
        this.showPercentageL.flag = false;
        this.showPercentageL.name = "OFF";
        this.findPercentageA(percent);
      }else{
        this.showPercentageA.name = "OFF";
        this.totalStudentPercentA = [];
      }
    }else{
      this.toastr.warning("กรุณาตั้งค่า % การเข้าเรียน");
    }
  }

  onSwitchShowPercentQ(percent){
    if(percent != undefined){
      this.showPercentageQ.flag= !this.showPercentageQ.flag;
      if(this.showPercentageQ.flag){
        this.showPercentageQ.name = "ON";
        this.totalStudentPercentQ = [];
        this.showPercentageA.flag = false;
        this.showPercentageA.name = "OFF";
        this.showPercentageH.flag = false;
        this.showPercentageH.name = "OFF";
        this.showPercentageL.flag = false;
        this.showPercentageL.name = "OFF";
        this.findPercentageQ(percent);
      }else{
        this.showPercentageQ.name = "OFF";
        this.totalStudentPercentQ = [];
      }
    }else{
      this.toastr.warning("กรุณาตั้งค่า % ควิซ");
    }
  }

  onSwitchShowPercentH(percent){
    if(percent != undefined){
      this.showPercentageH.flag= !this.showPercentageH.flag;
      if(this.showPercentageH.flag){
        this.showPercentageH.name = "ON";
        this.totalStudentPercentH = [];
        this.showPercentageA.flag = false;
        this.showPercentageA.name = "OFF";
        this.showPercentageQ.flag = false;
        this.showPercentageQ.name = "OFF";
        this.showPercentageL.flag = false;
        this.showPercentageL.name = "OFF";
        this.findPercentageH(percent);
      }else{
        this.showPercentageH.name = "OFF";
        this.totalStudentPercentH = [];
      }
    }else{
      this.toastr.warning("กรุณาตั้งค่า % การบ้าน");
    }
  }

    onSwitchShowPercentL(percent){
      if(percent != undefined){
        this.showPercentageL.flag= !this.showPercentageL.flag;
        if(this.showPercentageL.flag){
          this.showPercentageL.name = "ON";
          this.totalStudentPercentH = [];
          this.showPercentageA.flag = false;
          this.showPercentageA.name = "OFF";
          this.showPercentageQ.flag = false;
          this.showPercentageQ.name = "OFF";
          this.showPercentageH.flag = false;
          this.showPercentageH.name = "OFF";
          this.findPercentageL(percent);
        }else{
          this.showPercentageL.name = "OFF";
          this.totalStudentPercentL = [];
        }
      }else{
        this.toastr.warning("กรุณาตั้งค่า % แลป");
      }
    }

  onSwitchShowMissClass(){
    this.showMissClass.flag= !this.showMissClass.flag;
    if(this.showMissClass.flag){
      this.showMissClass.name = "ON";
      this.totalMissClass = [];
      this.findMissClassNumber();
    }else{
      this.showMissClass.name = "OFF";
      this.totalMissClass = [];
    }
  }
  onSwitchShowGroup(){
    this.showGroup.flag= !this.showGroup.flag;
    if(this.showGroup.flag){
      this.showGroup.name = "ON";
    }else{
      this.showGroup.name = "OFF";
    }
  }
  ///////////////////////////////////////////////////////////
  openOnEdit(content) {
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
  ///////////////////////////////////////////////////////////////
  onFileSelect(files: FileList){
  //console.log(files);
  if(files && files.length > 0) {
     let file : File = files.item(0);
       let reader: FileReader = new FileReader();
       reader.readAsText(file);
       reader.onload = (e) => {
          this.csv = reader.result;
          //console.log(this.csv);
       }
    }
  }

  onUploadcsv(cid : string){
    var csvArray = this.csv.split(/\r?\n/);
    var csvArray2d = new Array();
    var regex = new RegExp("^[ก-๙a-zA-Z]+\\s[ก-๙a-zA-Z]+$");
    var overgroup = false;
    for (var i = 1; i < csvArray.length-1; i++){
      csvArray2d[i] = csvArray[i].split(",");
      if(csvArray2d[i][4] == 1 && this.groupList.length == 1){
        continue;
      }else if(csvArray2d[i][4] > this.groupList.length-1)
        overgroup = true;
    }
    //console.log(overgroup)
    if(overgroup)
      this.toastr.warning("จำนวนกลุ่มในไฟล์ csv มากกว่า จำนวนกลุ่มที่สร้างไว้");
    else{
      //console.log(this.studentListArr)
      for (var i = 1; i < csvArray2d.length; i++){
        if(regex.test(csvArray2d[i][2])){
          this.studentForm.value.id = csvArray2d[i][1];
          this.studentForm.value.name = csvArray2d[i][2];
          this.studentForm.value.group = csvArray2d[i][4];
          this.studentService.insertStudentCid(this.studentForm.value,cid);
          if(i == csvArray2d.length-1)
            this.toastr.success("Upload Successfully");
        }else{
            this.toastr.error("Upload Failed : Please upload UTF-8 Format");
            break;
        }
      }
    }
    this.csv = "";
  }
  // to excel
  exportToExcel() {
    var exA = [];
    var exQ = [];
    var exH = [];
    var exL = [];
    if(this.scheduleAttendanceList.length > 0){
      this.findPercentageA(this.percentAtt);
      for(var i=0; i<this.studentListArr.length; i++){
        var temp: {
          รหัสนักศึกษา: string,
          ชื่อ: string, กลุ่มเรียน: string,
          weightscore: number,
          att1: string, att2: string, att3: string, att4: string, att5: string,
          att6: string, att7: string, att8: string, att9: string, att10: string,
          att11: string, att12: string, att13: string, att14: string, att15: string,
          att16: string, att17: string, att18: string, att19: string, att20: string,
          att21: string, att22: string, att23: string, att24: string, att25: string,
          att26: string, att27: string, att28: string, att29: string, att30: string
        } = {} as {รหัสนักศึกษา: string, ชื่อ: string, กลุ่มเรียน: string,weightscore: number, att1: string,att2: string,att3: string, att4: string, att5: string,att6: string, att7: string,
          att8: string, att9: string, att10: string,att11: string, att12: string, att13: string, att14: string, att15: string,att16: string,
          att17: string, att18: string, att19: string, att20: string,att21: string, att22: string, att23: string, att24: string, att25: string,
          att26: string, att27: string, att28: string, att29: string, att30: string};
        temp.รหัสนักศึกษา = this.studentListArr[i].id;
        temp.ชื่อ = this.studentListArr[i].name;
        temp.กลุ่มเรียน = this.studentListArr[i].group;
        temp.weightscore = this.studentListArr[i].percent;
        temp.att1 = this.studentListArr[i].attendance[this.scheduleAttendanceList[0].id].score;
        if(this.scheduleAttendanceList.length <= 1){ exA.push(temp); continue; }
        temp.att2 = this.studentListArr[i].attendance[this.scheduleAttendanceList[1].id].score;
        if(this.scheduleAttendanceList.length <= 2){ exA.push(temp); continue; }
        temp.att3 = this.studentListArr[i].attendance[this.scheduleAttendanceList[2].id].score;
        if(this.scheduleAttendanceList.length <= 3){ exA.push(temp); continue; }
        temp.att4 = this.studentListArr[i].attendance[this.scheduleAttendanceList[3].id].score;
        if(this.scheduleAttendanceList.length <= 4){ exA.push(temp); continue; }
        temp.att5 = this.studentListArr[i].attendance[this.scheduleAttendanceList[4].id].score;
        if(this.scheduleAttendanceList.length <= 5){ exA.push(temp); continue; }
        temp.att6 = this.studentListArr[i].attendance[this.scheduleAttendanceList[5].id].score;
        if(this.scheduleAttendanceList.length <= 6){ exA.push(temp); continue; }
        temp.att7 = this.studentListArr[i].attendance[this.scheduleAttendanceList[6].id].score;
        if(this.scheduleAttendanceList.length <= 7){ exA.push(temp); continue; }
        temp.att8 = this.studentListArr[i].attendance[this.scheduleAttendanceList[7].id].score;
        if(this.scheduleAttendanceList.length <= 8){ exA.push(temp); continue; }
        temp.att9 = this.studentListArr[i].attendance[this.scheduleAttendanceList[8].id].score;
        if(this.scheduleAttendanceList.length <= 9){ exA.push(temp); continue; }
        temp.att10 = this.studentListArr[i].attendance[this.scheduleAttendanceList[9].id].score;
        if(this.scheduleAttendanceList.length <= 10){ exA.push(temp); continue; }
        temp.att11 = this.studentListArr[i].attendance[this.scheduleAttendanceList[10].id].score;
        if(this.scheduleAttendanceList.length <= 11){ exA.push(temp); continue; }
        temp.att12 = this.studentListArr[i].attendance[this.scheduleAttendanceList[11].id].score;
        if(this.scheduleAttendanceList.length <= 12){ exA.push(temp); continue; }
        temp.att13 = this.studentListArr[i].attendance[this.scheduleAttendanceList[12].id].score;
        if(this.scheduleAttendanceList.length <= 13){ exA.push(temp); continue; }
        temp.att14 = this.studentListArr[i].attendance[this.scheduleAttendanceList[13].id].score;
        if(this.scheduleAttendanceList.length <= 14){ exA.push(temp); continue; }
        temp.att15 = this.studentListArr[i].attendance[this.scheduleAttendanceList[14].id].score;
        if(this.scheduleAttendanceList.length <= 15){ exA.push(temp); continue; }
        temp.att16 = this.studentListArr[i].attendance[this.scheduleAttendanceList[15].id].score;
        if(this.scheduleAttendanceList.length <= 16){ exA.push(temp); continue; }
        temp.att17 = this.studentListArr[i].attendance[this.scheduleAttendanceList[16].id].score;
        if(this.scheduleAttendanceList.length <= 17){ exA.push(temp); continue; }
        temp.att18 = this.studentListArr[i].attendance[this.scheduleAttendanceList[17].id].score;
        if(this.scheduleAttendanceList.length <= 18){ exA.push(temp); continue; }
        temp.att19 = this.studentListArr[i].attendance[this.scheduleAttendanceList[18].id].score;
        if(this.scheduleAttendanceList.length <= 19){ exA.push(temp); continue; }
        temp.att20 = this.studentListArr[i].attendance[this.scheduleAttendanceList[19].id].score;
        if(this.scheduleAttendanceList.length <= 20){ exA.push(temp); continue; }
        temp.att21 = this.studentListArr[i].attendance[this.scheduleAttendanceList[20].id].score;
        if(this.scheduleAttendanceList.length <= 21){ exA.push(temp); continue; }
        temp.att22 = this.studentListArr[i].attendance[this.scheduleAttendanceList[21].id].score;
        if(this.scheduleAttendanceList.length <= 22){ exA.push(temp); continue; }
        temp.att23 = this.studentListArr[i].attendance[this.scheduleAttendanceList[22].id].score;
        if(this.scheduleAttendanceList.length <= 23){ exA.push(temp); continue; }
        temp.att24 = this.studentListArr[i].attendance[this.scheduleAttendanceList[23].id].score;
        if(this.scheduleAttendanceList.length <= 24){ exA.push(temp); continue; }
        temp.att25 = this.studentListArr[i].attendance[this.scheduleAttendanceList[24].id].score;
        if(this.scheduleAttendanceList.length <= 25){ exA.push(temp); continue; }
        temp.att26 = this.studentListArr[i].attendance[this.scheduleAttendanceList[25].id].score;
        if(this.scheduleAttendanceList.length <= 26){ exA.push(temp); continue; }
        temp.att27 = this.studentListArr[i].attendance[this.scheduleAttendanceList[26].id].score;
        if(this.scheduleAttendanceList.length <= 27){ exA.push(temp); continue; }
        temp.att28 = this.studentListArr[i].attendance[this.scheduleAttendanceList[27].id].score;
        if(this.scheduleAttendanceList.length <= 28){ exA.push(temp); continue; }
        temp.att29 = this.studentListArr[i].attendance[this.scheduleAttendanceList[28].id].score;
        if(this.scheduleAttendanceList.length <= 29){ exA.push(temp); continue; }
        temp.att30 = this.studentListArr[i].attendance[this.scheduleAttendanceList[29].id].score;
        if(this.scheduleAttendanceList.length <= 30){ exA.push(temp); continue; }
      };
    }

    if(this.scheduleQuizList.length > 0){
      this.findPercentageQ(this.percentQuiz);
      for(var i=0; i<this.studentListArr.length; i++){
        var temp2: {
          รหัสนักศึกษา: string,
          ชื่อ: string, กลุ่มเรียน: string,weightscore: number,
          quiz1: string, quiz2: string, quiz3: string, quiz4: string, quiz5: string,
          quiz6: string, quiz7: string, quiz8: string, quiz9: string, quiz10: string,
          quiz11: string, quiz12: string, quiz13: string, quiz14: string, quiz15: string
          } = {} as {รหัสนักศึกษา: string, ชื่อ: string,กลุ่มเรียน: string, weightscore: number, quiz1: string,quiz2: string,quiz3: string, quiz4: string, quiz5: string,quiz6: string, quiz7: string,
              quiz8: string, quiz9: string, quiz10: string,quiz11: string, quiz12: string, quiz13: string, quiz14: string, quiz15: string };
          temp2.รหัสนักศึกษา = this.studentListArr[i].id;
          temp2.ชื่อ = this.studentListArr[i].name;
          temp2.กลุ่มเรียน = this.studentListArr[i].group;
          temp2.weightscore = this.studentListArr[i].percent;
          temp2.quiz1 = this.studentListArr[i].quiz[this.scheduleQuizList[0].id].score;
          if(this.scheduleQuizList.length <= 1){ exQ.push(temp2); continue; }
          temp2.quiz2 = this.studentListArr[i].quiz[this.scheduleQuizList[1].id].score;
          if(this.scheduleQuizList.length <= 2){ exQ.push(temp2); continue; }
          temp2.quiz3 = this.studentListArr[i].quiz[this.scheduleQuizList[2].id].score;
          if(this.scheduleQuizList.length <= 3){ exQ.push(temp2); continue; }
          temp2.quiz4 = this.studentListArr[i].quiz[this.scheduleQuizList[3].id].score;
          if(this.scheduleQuizList.length <= 4){ exQ.push(temp2); continue; }
          temp2.quiz5 = this.studentListArr[i].quiz[this.scheduleQuizList[4].id].score;
          if(this.scheduleQuizList.length <= 5){ exQ.push(temp2); continue; }
          temp2.quiz6 = this.studentListArr[i].quiz[this.scheduleQuizList[5].id].score;
          if(this.scheduleQuizList.length <= 6){ exQ.push(temp2); continue; }
          temp2.quiz7 = this.studentListArr[i].quiz[this.scheduleQuizList[6].id].score;
          if(this.scheduleQuizList.length <= 7){ exQ.push(temp2); continue; }
          temp2.quiz8 = this.studentListArr[i].quiz[this.scheduleQuizList[7].id].score;
          if(this.scheduleQuizList.length <= 8){ exQ.push(temp2); continue; }
          temp2.quiz9 = this.studentListArr[i].quiz[this.scheduleQuizList[8].id].score;
          if(this.scheduleQuizList.length <= 9){ exQ.push(temp2); continue; }
          temp2.quiz10 = this.studentListArr[i].quiz[this.scheduleQuizList[9].id].score;
          if(this.scheduleQuizList.length <= 10){ exQ.push(temp2); continue; }
          temp2.quiz11 = this.studentListArr[i].quiz[this.scheduleQuizList[10].id].score;
          if(this.scheduleQuizList.length <= 11){ exQ.push(temp2); continue; }
          temp2.quiz12 = this.studentListArr[i].quiz[this.scheduleQuizList[11].id].score;
          if(this.scheduleQuizList.length <= 12){ exQ.push(temp2); continue; }
          temp2.quiz13 = this.studentListArr[i].quiz[this.scheduleQuizList[12].id].score;
          if(this.scheduleQuizList.length <= 13){ exQ.push(temp2); continue; }
          temp2.quiz14 = this.studentListArr[i].quiz[this.scheduleQuizList[13].id].score;
          if(this.scheduleQuizList.length <= 14){ exQ.push(temp2); continue; }
          temp2.quiz15 = this.studentListArr[i].quiz[this.scheduleQuizList[14].id].score;
          if(this.scheduleQuizList.length <= 15){ exQ.push(temp2); continue; }
      };
    }
    if(this.scheduleHomeworkList.length > 0){
      this.findPercentageH(this.percentHw);
      for(var i=0; i<this.studentListArr.length; i++){
          var temp3: {
            รหัสนักศึกษา: string,
            ชื่อ: string, กลุ่มเรียน: string,weightscore: number,
            hw1: string, hw2: string, hw3: string, hw4: string, hw5: string,
            hw6: string, hw7: string, hw8: string, hw9: string, hw10: string,
            hw11: string, hw12: string, hw13: string, hw14: string, hw15: string
          } = {} as {รหัสนักศึกษา: string, ชื่อ: string, กลุ่มเรียน: string,weightscore: number, hw1: string,hw2: string,hw3: string, hw4: string, hw5: string,hw6: string, hw7: string,
            hw8: string, hw9: string, hw10: string,hw11: string, hw12: string, hw13: string, hw14: string, hw15: string };
          temp3.รหัสนักศึกษา = this.studentListArr[i].id;
          temp3.ชื่อ = this.studentListArr[i].name;
          temp3.กลุ่มเรียน = this.studentListArr[i].group;
          temp3.weightscore = this.studentListArr[i].percent;
          temp3.hw1 = this.studentListArr[i].hw[this.scheduleHomeworkList[0].id].score;
          if(this.scheduleHomeworkList.length <= 1){ exH.push(temp3); continue; }
          temp3.hw2 = this.studentListArr[i].hw[this.scheduleHomeworkList[1].id].score;
          if(this.scheduleHomeworkList.length <= 2){ exH.push(temp3); continue; }
          temp3.hw3 = this.studentListArr[i].hw[this.scheduleHomeworkList[2].id].score;
          if(this.scheduleHomeworkList.length <= 3){ exH.push(temp3); continue; }
          temp3.hw4 = this.studentListArr[i].hw[this.scheduleHomeworkList[3].id].score;
          if(this.scheduleHomeworkList.length <= 4){ exH.push(temp3); continue; }
          temp3.hw5 = this.studentListArr[i].hw[this.scheduleHomeworkList[4].id].score;
          if(this.scheduleHomeworkList.length <= 5){ exH.push(temp3); continue; }
          temp3.hw6 = this.studentListArr[i].hw[this.scheduleHomeworkList[5].id].score;
          if(this.scheduleHomeworkList.length <= 6){ exH.push(temp3); continue; }
          temp3.hw7 = this.studentListArr[i].hw[this.scheduleHomeworkList[6].id].score;
          if(this.scheduleHomeworkList.length <= 7){ exH.push(temp3); continue; }
          temp3.hw8 = this.studentListArr[i].hw[this.scheduleHomeworkList[7].id].score;
          if(this.scheduleHomeworkList.length <= 8){ exH.push(temp3); continue; }
          temp3.hw9 = this.studentListArr[i].hw[this.scheduleHomeworkList[8].id].score;
          if(this.scheduleHomeworkList.length <= 9){ exH.push(temp3); continue; }
          temp3.hw10 = this.studentListArr[i].hw[this.scheduleHomeworkList[9].id].score;
          if(this.scheduleHomeworkList.length <= 10){ exH.push(temp3); continue; }
          temp3.hw11 = this.studentListArr[i].hw[this.scheduleHomeworkList[10].id].score;
          if(this.scheduleHomeworkList.length <= 11){ exH.push(temp3); continue; }
          temp3.hw12 = this.studentListArr[i].hw[this.scheduleHomeworkList[11].id].score;
          if(this.scheduleHomeworkList.length <= 12){ exH.push(temp3); continue; }
          temp3.hw13 = this.studentListArr[i].hw[this.scheduleHomeworkList[12].id].score;
          if(this.scheduleHomeworkList.length <= 13){ exH.push(temp3); continue; }
          temp3.hw14 = this.studentListArr[i].hw[this.scheduleHomeworkList[13].id].score;
          if(this.scheduleHomeworkList.length <= 14){ exH.push(temp3); continue; }
          temp3.hw15 = this.studentListArr[i].hw[this.scheduleHomeworkList[14].id].score;
          if(this.scheduleHomeworkList.length <= 15){ exH.push(temp3); continue; }
      };
    }
    if(this.scheduleLabList.length > 0){
      this.findPercentageL(this.percentLab);
      for(var i=0; i<this.studentListArr.length; i++){
          var temp4: {
            รหัสนักศึกษา: string,
            ชื่อ: string, กลุ่มเรียน: string,weightscore: number,
            lab1: string, lab2: string, lab3: string, lab4: string, lab5: string,
            lab6: string, lab7: string, lab8: string, lab9: string, lab10: string,
            lab11: string, lab12: string, lab13: string, lab14: string, lab15: string
          } = {} as {รหัสนักศึกษา: string, ชื่อ: string, กลุ่มเรียน: string,weightscore: number, lab1: string,lab2: string,lab3: string, lab4: string, lab5: string,lab6: string, lab7: string,
            lab8: string, lab9: string, lab10: string,lab11: string, lab12: string, lab13: string, lab14: string, lab15: string };
          temp4.รหัสนักศึกษา = this.studentListArr[i].id;
          temp4.ชื่อ = this.studentListArr[i].name;
          temp4.กลุ่มเรียน = this.studentListArr[i].group;
          temp4.weightscore = this.studentListArr[i].percent;
          temp4.lab1 = this.studentListArr[i].lab[this.scheduleLabList[0].id].score;
          if(this.scheduleLabList.length <= 1){ exL.push(temp4); continue; }
          temp4.lab2 = this.studentListArr[i].lab[this.scheduleLabList[1].id].score;
          if(this.scheduleLabList.length <= 2){ exL.push(temp4); continue; }
          temp4.lab3 = this.studentListArr[i].lab[this.scheduleLabList[2].id].score;
          if(this.scheduleLabList.length <= 3){ exL.push(temp4); continue; }
          temp4.lab4 = this.studentListArr[i].lab[this.scheduleLabList[3].id].score;
          if(this.scheduleLabList.length <= 4){ exL.push(temp4); continue; }
          temp4.lab5 = this.studentListArr[i].lab[this.scheduleLabList[4].id].score;
          if(this.scheduleLabList.length <= 5){ exL.push(temp4); continue; }
          temp4.lab6 = this.studentListArr[i].lab[this.scheduleLabList[5].id].score;
          if(this.scheduleLabList.length <= 6){ exL.push(temp4); continue; }
          temp4.lab7 = this.studentListArr[i].lab[this.scheduleLabList[6].id].score;
          if(this.scheduleLabList.length <= 7){ exL.push(temp4); continue; }
          temp4.lab8 = this.studentListArr[i].lab[this.scheduleLabList[7].id].score;
          if(this.scheduleLabList.length <= 8){ exL.push(temp4); continue; }
          temp4.lab9 = this.studentListArr[i].lab[this.scheduleLabList[8].id].score;
          if(this.scheduleLabList.length <= 9){ exL.push(temp4); continue; }
          temp4.lab10 = this.studentListArr[i].lab[this.scheduleLabList[9].id].score;
          if(this.scheduleLabList.length <= 10){ exL.push(temp4); continue; }
          temp4.lab11 = this.studentListArr[i].lab[this.scheduleLabList[10].id].score;
          if(this.scheduleLabList.length <= 11){ exL.push(temp4); continue; }
          temp4.lab12 = this.studentListArr[i].lab[this.scheduleLabList[11].id].score;
          if(this.scheduleLabList.length <= 12){ exL.push(temp4); continue; }
          temp4.lab13 = this.studentListArr[i].lab[this.scheduleLabList[12].id].score;
          if(this.scheduleLabList.length <= 13){ exL.push(temp4); continue; }
          temp4.lab14 = this.studentListArr[i].lab[this.scheduleLabList[13].id].score;
          if(this.scheduleLabList.length <= 14){ exL.push(temp4); continue; }
          temp4.lab15 = this.studentListArr[i].lab[this.scheduleLabList[14].id].score;
          if(this.scheduleLabList.length <= 15){ exL.push(temp4); continue; }
      };
    }
    //console.log(this.studentListArr);
    //console.log(exA);
    //console.log(exQ);
    //console.log(exH);
    this.excelService.exportAsExcelFile( exA , exQ , exH , exL ,this.courseId,this.groupId,this.courseName);

  }
}
