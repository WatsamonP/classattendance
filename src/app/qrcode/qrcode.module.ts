import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QrcodeRoutingModule } from './qrcode-routing.module';
import { QrcodeComponent } from './qrcode.component';

import { FormsModule, ReactiveFormsModule  } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    QrcodeRoutingModule,
    FormsModule, ReactiveFormsModule
  ],
  declarations: [QrcodeComponent]
})
export class QrcodeModule { }
