import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CourseRoutingModule } from './course-routing.module';
import { CourseComponent } from './course.component';
import { PageHeaderModule } from './../../shared';
//
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule, CourseRoutingModule, PageHeaderModule,
    FormsModule, ReactiveFormsModule,
    NgbModule.forRoot()
  ],
  declarations: [CourseComponent]
})
export class CourseModule {}
