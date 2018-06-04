import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {StudentcheckRoutingModule } from './studentcheck-routing.module';
import { StudentcheckComponent } from './studentcheck.component';

import { FormsModule, ReactiveFormsModule  } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    StudentcheckRoutingModule,
    FormsModule, ReactiveFormsModule
  ],
  declarations: [StudentcheckComponent]
})
export class StudentcheckModule { }
