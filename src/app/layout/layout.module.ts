import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';

//Service
import { CourseService } from '../shared/services/course/course.service';
import { StudentService } from '../shared/services/student/student.service';

@NgModule({
    imports: [
        CommonModule,
        LayoutRoutingModule,
        TranslateModule,
        NgbDropdownModule.forRoot(),
    ],
    declarations: [LayoutComponent, SidebarComponent, HeaderComponent],
    providers: [CourseService, StudentService],
})
export class LayoutModule {}
