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
  id: number;
  name: string;
  year: number;
  trimester: number;
  
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
      id: new FormControl('', []),
      name: new FormControl('', []),
      year: new FormControl('', []),
      trimester: new FormControl('', [])
    });
  }

  insertCourse(){
    //this.courseService.setCourseId(this.courseForm.value.id);
    //console.log(this.courseForm.value);

    this.courseService.insertCourse(this.courseForm.value);
    this.toastr.success("สร้างรายวิชา"+this.courseForm.value.id
      +" : "+ this.courseForm.value.name+" สำเร็จ");
    //console.log(this.courseForm.value);
    //console.log(this.auth.currentUserId);
    //console.log(this.courseForm.value.id);
  }
}
