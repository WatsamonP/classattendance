import { Component, OnInit, Input, Inject } from '@angular/core';
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

@Component({
    selector: 'app-course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.scss'],
    animations: [routerTransition(), slideInDownAnimation],
})

export class CourseComponent implements OnInit {
  isSubmit = null;
  //Course
  courseList: Course[];
  courseId;
  groupId;
  private selectedId: number;
  //Student
  studentForm: FormGroup;
  studentList: Student[];
  studentListArr: any;
  IsHidden= true;
  csvhidden= true;
  //
  //defaultTime = {hour: 23, minute: 0};
  count : 0;
  count_attendance : 0;
  count_quiz : 0;
  count_hw : 0;
  editCourseForm : FormGroup;
  //
  attendanceForm: FormGroup;
  closeResult: string;
  scheduleAttendanceList : any;
  scheduleQuizList : any;
  scheduleHomeworkList : any;
  csv: string;
  x : any;
  y : any;
  percentFlag = false;
  totalStudentPercent = [];
  totalMissClass = [];
  showMissClass = {flag: false, name:"OFF"};
  showPercentage= {flag: false, name:"OFF"};
  showGroup= {flag: false, name:"OFF"};
  scoreCase = {high: 5, med:4, low:2};
  btn_attendance = [];
  btn_quiz = [];
  btn_hw = [];
  radioSelected : 1;
  scheduleAttendanceSortList : any;
  scheduleQuizSortList : any;
  scheduleHomeworkSortList : any;
  groupList : any;
  constructor(
    private auth: AuthService,
    private courseService: CourseService,
    private studentService: StudentService,
    private db: AngularFireDatabase,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private excelService: ExcelService) {
  }

  ngOnInit() {
    // set course ID จาก route
    //let id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.route.paramMap.subscribe((params: ParamMap) => {
      let id = parseInt(params.get('id'));
      let group = params.get('group').toString();
      this.courseId = id;
      this.groupId = group;
      console.log(this.groupId);
      this.totalStudentPercent = [];

      //Query Course
      this.db.list(`users/${this.auth.currentUserId}/course/`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(items => {
          this.courseList = items;
          for(var i=0; i<this.courseList.length; i++){
            if(this.courseList[i].id == this.courseId ){
              this.groupList = Object.keys(this.courseList[i].group)
                .map(key => Object.assign({ key }, this.courseList[i].group[key]));
            }
          }
            return items.map(item => item.key);
        });

      // iden Quert ///////////////////////////////////////////
      if(this.groupId != 'all'){
        // For a Group  /////////////////////////////////////////////
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/students`).snapshotChanges().map(actions => {
          return actions.map(action => ({ key: action.key, ...action.payload.val() }));
          }).subscribe(items => {
          this.studentList = items;
          
          let temp = [];
          for(var i=0; i<this.studentList.length ;i++){
            console.log(this.studentList[i].group + ' HH' + this.groupId);
            if(this.studentList[i].group == this.groupId){
              temp.push(this.studentList[i]);
              continue;
            }
          }
          this.studentListArr = Object.keys(temp)
            .map(key => Object.assign({ key }, temp[key]));
            return items.map(item => item.key);
        });

        // 1. Query scheduleAttendanceList
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/schedule/attendance`).snapshotChanges().map(actions => {
          return actions.map(action => ({ key: action.key, ...action.payload.val() }));
          }).subscribe(items => {
            this.scheduleAttendanceList = items;
            this.btn_attendance =[];
            for(var i=0 ; i<this.scheduleAttendanceList.length ;i++){
              if(i>3){
                this.btn_attendance.push({id:i+1,name: '-'+(i+1)+'-'});
              }
            }

            let sdtLen =  this.scheduleAttendanceList.length;
            this.scheduleAttendanceSortList = [];
            var i=0;
            var count=0;
            for (sdtLen; sdtLen > i; i++) {
              count++;
              this.scheduleAttendanceSortList.push(this.scheduleAttendanceList[i]);
              if(count==7){
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
          this.btn_attendance =[];
          for(var i=0 ; i<this.scheduleQuizList.length ;i++){
            if(i>3){
              this.btn_quiz.push({id:i+1,name: '-'+(i+1)+'-'});
            }
          }

          let sdtLen =  this.scheduleQuizList.length;
          this.scheduleQuizSortList = [];
          var i=0;
          var count=0;
          for (sdtLen; sdtLen > i; i++) {
            count++;
            this.scheduleQuizSortList.push(this.scheduleQuizList[i]);
            if(count==7){
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
          for(var i=0 ; i<this.scheduleHomeworkList.length ;i++){
            if(i>3){
              this.btn_hw.push({id:i+1,name: '-'+(i+1)+'-'});
            }
          }

          let sdtLen =  this.scheduleHomeworkList.length;
          this.scheduleHomeworkSortList = [];
          var i=0;
          var count=0;
          for (sdtLen; sdtLen > i; i++) {
            count++;
            this.scheduleHomeworkSortList.push(this.scheduleHomeworkList[i]);
            if(count==7){
              break;
            }
          };
            return items.map(item => item.key);
        });
      
      }else{
        // For All Group  /////////////////////////////////////////////
        //Query Student
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/students`).snapshotChanges().map(actions => {
          return actions.map(action => ({ key: action.key, ...action.payload.val() }));
          }).subscribe(items => {
          this.studentList = items;
          this.studentListArr = Object.keys(items).map(key => Object.assign({ key }, items[key]));

            return items.map(item => item.key);
        });

        // 1. Query scheduleAttendanceList
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/schedule/attendance`).snapshotChanges().map(actions => {
          return actions.map(action => ({ key: action.key, ...action.payload.val() }));
          }).subscribe(items => {
            this.scheduleAttendanceList = items;
            this.btn_attendance =[];
            for(var i=0 ; i<this.scheduleAttendanceList.length ;i++){
              if(i>3){
                this.btn_attendance.push({id:i+1,name: '-'+(i+1)+'-'});
              }
            }

            let sdtLen =  this.scheduleAttendanceList.length;
            this.scheduleAttendanceSortList = [];
            var i=0;
            var count=0;
            for (sdtLen; sdtLen > i; i++) {
              count++;
              this.scheduleAttendanceSortList.push(this.scheduleAttendanceList[i]);
              if(count==7){
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
            return items.map(item => item.key);
        });

        // 3. Query Homwork
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/schedule/hw`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(items => {
          this.scheduleHomeworkList = items;
            return items.map(item => item.key);
        });

      } //End All Group

    });
  

    // buildForm for Student /////////////////////////////////////////////////////////////
    this.buildForm();
  }

  radioCheckA(id){
    let sdtLen =  this.scheduleAttendanceList.length;
    this.scheduleAttendanceSortList = [];
    var i=0;
    let count=0
    for (id ; id > i; i++) {
      this.scheduleAttendanceSortList.push(this.scheduleAttendanceList[i]);
    };
  }
  radioCheckQ(id){
    let sdtLen =  this.scheduleQuizList.length;
    this.scheduleQuizSortList = [];
    var i=0;
    let count=0
    for (id ; id > i; i++) {
      this.scheduleQuizSortList.push(this.scheduleQuizList[i]);
    };
  }
  radioCheckH(id){
    let sdtLen =  this.scheduleHomeworkList.length;
    this.scheduleHomeworkSortList = [];
    var i=0;
    let count=0
    for (id ; id > i; i++) {
      this.scheduleHomeworkSortList.push(this.scheduleHomeworkList[i]);
    };
  }

  findPercentage(percent : Number){

    let schedule,score,temp,temp2,fullScore;
    if(this.scheduleAttendanceList.length==0){
      console.log('ZERO')
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
        this.totalStudentPercent.push(Number(temp)*Number(percent)/Number(fullScore));
        this.studentListArr = Object.keys(this.studentListArr)
        .map(key => Object.assign({ key }, this.studentListArr[key], {percent:this.totalStudentPercent[key]}));

      }
    }
  }

  findMissClassNumber(){
    let schedule,score,temp,temp2;
    if(this.scheduleAttendanceList.length==0){
      console.log('ZERO')
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
    console.log(this.studentListArr);
  }




  // Button
  onEditCourse(course: Course) {
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
  get group() {
    return this.studentForm.get('group');
  }
  // buildForm for Student /////////////////////////////////////////////////////////////
  buildForm(): void {
    this.studentForm = new FormGroup({
      id: new FormControl('', [
        Validators.required,
        Validators.pattern("^[B]\\d{7}$")
      ]),
      name: new FormControl('', [
        //Validators.required
      ]),
      group: new FormControl('', [
        //Validators.required
      ]),
    });
    //
    this.attendanceForm = new FormGroup({
      student_id: new FormControl('', []),
      type: new FormControl('', []),
      score: new FormControl(0, []),
    });
    this.editCourseForm = new FormGroup({
      name: new FormControl('', []),
      year: new FormControl('', []),
      trimester: new FormControl('', []),
      percentAtt: new FormControl(0, []),
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
      alert('ไม่มีกลุ่มเรียนนี้');
      // ปล ใส่ Validation ให้หน่อย
      // หรือ แก้ในหน้า HTML ให้เป็น List
    }
  }

  onDeleteStudent(id: string) {
    if (confirm('Are you sure to delete this record ?') == true) {
      this.studentService.deleteStudent(this.courseId,id);
      this.toastr.success("Deleted Successfully");
    }
  }

  ///////////////////////////////////////////////////
  onSwitch(){
    this.IsHidden= !this.IsHidden;
  }
  onSwitchcsv(){
    this.csvhidden= !this.csvhidden;
  }
  onSwitchShowPercent(percent){
    if(percent != undefined){
      this.showPercentage.flag= !this.showPercentage.flag;
      if(this.showPercentage.flag){
        this.showPercentage.name = "ON";
        this.totalStudentPercent = [];
        this.findPercentage(percent);
      }else{
        this.showPercentage.name = "OFF";
        this.totalStudentPercent = [];
      }
    }else{
      alert('แก้ไข Percent การเข้าเรียน');
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
  console.log(files);
  if(files && files.length > 0) {
     let file : File = files.item(0);
       let reader: FileReader = new FileReader();
       reader.readAsText(file);
       reader.onload = (e) => {
          this.csv = reader.result;
          console.log(this.csv);
       }
    }
  }

  onUploadcsv(cid : string){
    console.log(this.studentForm.value)
    var csvArray = this.csv.split(/\r?\n/);
    var csvArray2d = new Array();
    var regex = new RegExp("^[ก-๙a-zA-Z]+\\s[ก-๙a-zA-Z]+$");
    for (var i = 1; i < csvArray.length-1; i++){
      csvArray2d[i] = csvArray[i].split(",");
      //console.log(csvArray2d[i][2]);
      //console.log(regex.test(csvArray2d[i][2]));
      if(regex.test(csvArray2d[i][2])){
        this.studentForm.value.id = csvArray2d[i][1];
        this.studentForm.value.name = csvArray2d[i][2];
        this.studentForm.value.group = csvArray2d[i][4];
        this.studentService.insertStudentCid(this.studentForm.value,cid);
        if(i == csvArray.length-2)
          this.toastr.success("Upload Successfully");
      }else{
        this.toastr.error("Upload Failed : Please upload UTF-8 Format");
        break;
      }

    }
  }
  // to excel
  exportToExcel(event) {
    var exA = [];
    var exQ = [];
    var exH = [];
    if(this.scheduleAttendanceList.length > 0)
      for(var i=0; i<this.studentListArr.length; i++){
        var temp: {
          id: string,
          name: string,
          att1: string, att2: string, att3: string, att4: string, att5: string,
          att6: string, att7: string, att8: string, att9: string, att10: string,
          att11: string, att12: string, att13: string, att14: string, att15: string,
          att16: string, att17: string, att18: string, att19: string, att20: string,
          att21: string, att22: string, att23: string, att24: string, att25: string,
          att26: string, att27: string, att28: string, att29: string, att30: string
        } = {} as {id: string, name: string, att1: string,att2: string,att3: string, att4: string, att5: string,att6: string, att7: string,
          att8: string, att9: string, att10: string,att11: string, att12: string, att13: string, att14: string, att15: string,att16: string,
          att17: string, att18: string, att19: string, att20: string,att21: string, att22: string, att23: string, att24: string, att25: string,
          att26: string, att27: string, att28: string, att29: string, att30: string};
        temp.id = this.studentListArr[i].id;
        temp.name = this.studentListArr[i].name;
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
      };

    if(this.scheduleQuizList.length > 0)
      for(var i=0; i<this.studentListArr.length; i++){
        var temp2: {
          id: string,
          name: string,
          quiz1: string, quiz2: string, quiz3: string, quiz4: string, quiz5: string,
          quiz6: string, quiz7: string, quiz8: string, quiz9: string, quiz10: string,
          quiz11: string, quiz12: string, quiz13: string, quiz14: string, quiz15: string
          } = {} as {id: string, name: string, quiz1: string,quiz2: string,quiz3: string, quiz4: string, quiz5: string,quiz6: string, quiz7: string,
              quiz8: string, quiz9: string, quiz10: string,quiz11: string, quiz12: string, quiz13: string, quiz14: string, quiz15: string };
          temp2.id = this.studentListArr[i].id;
          temp2.name = this.studentListArr[i].name;
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
      };

    if(this.scheduleHomeworkList.length > 0)
        for(var i=0; i<this.studentListArr.length; i++){
          var temp3: {
            id: string,
            name: string,
            hw1: string, hw2: string, hw3: string, hw4: string, hw5: string,
            hw6: string, hw7: string, hw8: string, hw9: string, hw10: string,
            hw11: string, hw12: string, hw13: string, hw14: string, hw15: string
          } = {} as {id: string, name: string, hw1: string,hw2: string,hw3: string, hw4: string, hw5: string,hw6: string, hw7: string,
            hw8: string, hw9: string, hw10: string,hw11: string, hw12: string, hw13: string, hw14: string, hw15: string };
          temp3.id = this.studentListArr[i].id;
          temp3.name = this.studentListArr[i].name;
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
      };
      console.log(this.studentListArr);
    console.log(exA);
    console.log(exQ);
    console.log(exH);
    this.excelService.exportAsExcelFile( exA , exQ , exH ,'studentlist');
  }
}
