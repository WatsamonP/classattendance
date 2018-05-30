import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from "../../../shared/services/auth.service";
import { CourseService } from "../../../shared/services/course/course.service";
@Component({
    selector: 'app-add-course',
    templateUrl: './add-course.component.html',
    styleUrls: ['./add-course.component.scss'],
    animations: [routerTransition()]
})
export class AddCourseComponent implements OnInit {

  courseForm: FormGroup;
  isSubmit = null;
  years: any;
  yearsList: number[] = [];
  terms: number[] = [1,2,3];
  constructor(
    private auth: AuthService,
    private courseService: CourseService,
    private db: AngularFireDatabase,
    private toastr: ToastrService) {
  }

  ngOnInit() {
    this.buildForm();
    //setyearlist
    this.years = new Date().getFullYear() + 543;
    for (var i = 0; i < 5; i++) {
        this.yearsList.push(this.years-i)
    };
  }

  buildForm(): void {
    this.courseForm = new FormGroup({
      id: new FormControl('', [
        Validators.required,
        Validators.pattern("^[1-9]\\d{5}$")
       ]),
      name: new FormControl('', [
        Validators.required,
      ]),
      year: new FormControl('', [
        Validators.required
      ]),
      trimester: new FormControl('', [
        Validators.required
      ])
    });
  }

  //Validators
  get id() {
     return this.courseForm.get('id');
  }
  get name() {
     return this.courseForm.get('name');
  }
  get year() {
     return this.courseForm.get('year');
  }
  get trimester() {
     return this.courseForm.get('trimester');
  }
  insertCourse(){
    //this.courseService.setCourseId(this.courseForm.value.id);
    console.log(this.courseForm.value);
    console.log(this.yearsList);
    this.isSubmit = true;
    if (this.courseForm.invalid) {
        return;
    }
        this.courseService.insertCourse(this.courseForm.value);
        this.toastr.success("สร้างรายวิชา"+this.courseForm.value.id
          +" : "+ this.courseForm.value.name+" สำเร็จ");

    //console.log(this.courseForm.value);
    //console.log(this.auth.currentUserId);
    //console.log(this.courseForm.value.id);
  }
}
