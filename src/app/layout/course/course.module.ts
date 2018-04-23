import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CourseRoutingModule } from './course-routing.module';
import { CourseComponent } from './course.component';
import { PageHeaderModule } from './../../shared';
//
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule, CourseRoutingModule, PageHeaderModule,
    FormsModule, ReactiveFormsModule 
  ],
  declarations: [CourseComponent]
})
export class CourseModule {}
