import { Component, OnInit, Input } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

import { AuthService } from "../../shared/services/auth.service";
import { CourseService } from "../../shared/services/course/course.service";
import { StudentService } from "../../shared/services/student/student.service";
import { Course } from '../../shared/services/course/course.model';
import { Student } from '../../shared/services/student/student.model';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Router } from '@angular/router';
import { slideInDownAnimation } from '../animations';

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
  //
  scoreQuiz: any;
  scoreAttendance: any;
  scoreHw: any;
  //
  attendanceForm: FormGroup;

  constructor(
    private auth: AuthService, 
    private courseService: CourseService, 
    private studentService: StudentService, 
    private db: AngularFireDatabase,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router) {
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
          this.studentList = items;
            return items.map(item => item.key);
        });

      //Query Quiz Score
      this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/score/quiz`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(items => {
          this.scoreQuiz = items;
            return items.map(item => item.key);
        });
      //Query Attendances Score
      this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/score/attendance`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(items => {
          this.scoreAttendance = items;
            return items.map(item => item.key);
        });
      //Query Hw Score
      this.db.list(`users/${this.auth.currentUserId}/course/${this.courseId}/score/homework`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(items => {
          this.scoreHw = items;
            return items.map(item => item.key);
        });



    });

    // buildForm for Student /////////////////////////////////////////////////////////////
    this.buildForm();

  }

  // Button
  onEdit(course: Course) {
    console.log(course.id);
    //this.courseService.selectedCourse = Object.assign({}, course);
  }

  onDelete(id: string) {
    if (confirm('Are you sure to delete this record ?') == true) {
      this.courseService.deleteCourse(id);
      this.toastr.success("Deleted Successfully", "Employee register");
    }
  }

  // buildForm for Student /////////////////////////////////////////////////////////////
  buildForm(): void {
    this.studentForm = new FormGroup({
      id: new FormControl('', []),
      name: new FormControl('', []),
    });

    this.attendanceForm = new FormGroup({
      date: new FormControl('', []),
      status: new FormControl('', []),
    });
  }

  createStudent(cid : number){
    this.studentService.insertStudentCid(this.studentForm.value,cid); 
  }

  onDeleteStudent(id: string) {
    if (confirm('Are you sure to delete this record ?') == true) {
      this.studentService.deleteStudent(this.courseId,id);
      this.toastr.success("Deleted Successfully", "Employee register");
    }
  }

  ///////////////////////////////////////////////////
  onSwitch(){
    this.IsHidden= !this.IsHidden;
  }
  //////////////////////////////////////////////////
  switchAttendance(){
    console.log("เช็คชื่อ");
  }

  switchHw(){
    console.log("HW");
  }

  switchQuiz(){
    console.log("Quiz");
  }

    isVisible = function(name){
    return true;// return false to hide this artist's albums
  }
}
