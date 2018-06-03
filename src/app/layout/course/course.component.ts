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
  radioSelected : 1;
  scheduleAttendanceSortList : any;
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
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/group/${this.groupId}/students`).snapshotChanges().map(actions => {
          return actions.map(action => ({ key: action.key, ...action.payload.val() }));
          }).subscribe(items => {
          this.studentList = items;
          this.studentListArr = Object.keys(items).map(key => Object.assign({ key }, items[key]));

            return items.map(item => item.key);
        });

        // 1. Query scheduleAttendanceList
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/group/${this.groupId}/schedule/attendance`).snapshotChanges().map(actions => {
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
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/group/${this.groupId}/schedule/quiz`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(items => {
          this.scheduleQuizList = items;
            return items.map(item => item.key);
        });
  
        // 3. Query Homwork
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/group/${this.groupId}/schedule/hw`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(items => {
          this.scheduleHomeworkList = items;
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
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/group/${this.groupId}/schedule/attendance`).snapshotChanges().map(actions => {
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
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/group/${this.groupId}/schedule/quiz`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(items => {
          this.scheduleQuizList = items;
            return items.map(item => item.key);
        });
  
        // 3. Query Homwork
        this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/group/${this.groupId}/schedule/hw`).snapshotChanges().map(actions => {
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

  radioCheck(id){
    let sdtLen =  this.scheduleAttendanceList.length;
    this.scheduleAttendanceSortList = [];
    var i=0;
    let count=0
    for (id ; id > i; i++) {
      this.scheduleAttendanceSortList.push(this.scheduleAttendanceList[i]);
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
    var csvArray = this.csv.split(/\r?\n/);
    var csvArray2d = new Array();
    var regex = new RegExp("^[ก-๙]+\\s[ก-๙]+$");
    for (var i = 1; i < csvArray.length-1; i++){
      csvArray2d[i] = csvArray[i].split(",");
      //console.log(csvArray2d[i][2]);
      //console.log(regex.test(csvArray2d[i][2]));
      if(regex.test(csvArray2d[i][2])){
        this.studentForm.value.id = csvArray2d[i][1];
        this.studentForm.value.name = csvArray2d[i][2];
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
    //array to export
    for(var i=0; i<this.studentList.length; i++){
      var temp: {
          id: string,
          name: string,
          score: string
      } = {} as  {id: string, name: string, score: string} ;
      temp.id = this.studentList[i].id;
      temp.name = this.studentList[i].name;
      //for(var j=0; j<this.scheduleAttendanceList.length; j++){
        temp.score = this.studentList[i].attendance[this.scheduleAttendanceList[0].id].score;
      //}
      exA.push(temp);
    }
    console.log(this.studentListArr);
    console.log(this.scheduleAttendanceList);
    console.log(exA);
    //this.excelService.exportAsExcelFile( exA , exA , exA ,'studentlist');
  }
}
