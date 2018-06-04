import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StudentcheckComponent } from './studentcheck.component';

const routes: Routes = [
    {
        path: '', component: StudentcheckComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class StudentcheckRoutingModule {}
