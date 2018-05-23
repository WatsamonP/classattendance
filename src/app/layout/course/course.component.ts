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

@Component({
    selector: 'app-course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.scss'],
    animations: [routerTransition(), slideInDownAnimation],
})
export class CourseComponent implements OnInit {

  //Course
  courseList: Course[];
  courseId;
  private selectedId: number;
  //Student
  studentForm: FormGroup;
  studentList: Student[];
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
  csv: string;
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
      this.courseId = id;

      //Query Course
      this.db.list(`users/${this.auth.currentUserId}/course/`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(items => {
          this.courseList = items;
            return items.map(item => item.key);
        });

      //Query Student
      this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/students`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(items => {
          if(items[0].attendance == undefined ){
            this.count_attendance = 0;
          }else{
            this.count_attendance = items[0].attendance.length;
          }
          if(items[0].quiz == undefined ){
            this.count_quiz = 0;
          }else{
            this.count_quiz = items[0].quiz.length;
          }
          if(items[0].hw == undefined ){
            this.count_hw = 0;
          }else{
            this.count_hw = items[0].hw.length;
          }

          this.studentList = items;
            return items.map(item => item.key);
        });

      //Query Course
      this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/schedule/attendance`).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(items => {
        console.log(items);
        this.scheduleAttendanceList = items;
          return items.map(item => item.key);
      });
    });

    // buildForm for Student /////////////////////////////////////////////////////////////
    this.buildForm();

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

  // buildForm for Student /////////////////////////////////////////////////////////////
  buildForm(): void {
    this.studentForm = new FormGroup({
      id: new FormControl('', []),
      name: new FormControl('', []),
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
      frequency: new FormControl(0, []),
    });
  }

  createStudent(cid : number){
    var regex = new RegExp("^[B]\\d{7}$");
    if(regex.test(this.studentForm.value.id)){
      this.studentService.insertStudentCid(this.studentForm.value,cid);
      this.toastr.success("Add Successfully");
    }else{
      this.toastr.warning("รูปแบบรหัสนักศึกษาไม่ถูกต้อง");
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
  onUploadcsv(cid : number){
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
    console.log(this.studentList);
    this.excelService.exportAsExcelFile( this.studentList , 'studentlist');
  }
}
