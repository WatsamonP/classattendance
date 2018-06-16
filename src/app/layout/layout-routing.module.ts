import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard' },
            { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule' },
            // 
            { path: 'add-course', loadChildren: './course/add-course/add-course.module#AddCourseModule' },
            { path: 'course/:id', loadChildren: './course/course.module#CourseModule' },
            { path: 'course/:id/:group', loadChildren: './course/course.module#CourseModule' },
            { path: 'course/:id/:group/:someEvent', loadChildren: './course/course.module#CourseModule' },

        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule {}
