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

  constructor(
    private auth: AuthService,
    private courseService: CourseService,
    private db: AngularFireDatabase,
    private toastr: ToastrService) {
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {
    this.courseForm = new FormGroup({
      id: new FormControl('', [
        Validators.required,
        Validators.pattern("^\\d{6}$")
       ]),
      name: new FormControl('', [
        Validators.required,
      ]),
      year: new FormControl('', [
        Validators.required,
        Validators.pattern("^\\d{4}$")
      ]),
      trimester: new FormControl('', [
        Validators.required,
        Validators.pattern("^[123]$")
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
    //console.log(this.courseForm.value);
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
