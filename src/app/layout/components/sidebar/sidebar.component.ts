import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, NavigationEnd, RouterLinkActive, ParamMap, ActivatedRoute, RouteReuseStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from "rxjs/Subscription";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
//Service
import { AuthService } from "../../../shared/services/auth.service";
import { CourseService } from '../../../shared/services/course/course.service';
import { Course } from '../../../shared/services/course/course.model';
import { ToastrService } from 'ngx-toastr';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent {

  isActive: boolean = false;
  showMenu: string = '';
  pushRightClass: string = 'push-right';

  private paramMapSubscription: Subscription;
  // Course Var
  public selectedId;
  courseList: Course[];

  constructor(
    private translate: TranslateService,
    public router: Router,
    private courseService: CourseService,
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private toastr: ToastrService,
    private db: AngularFireDatabase) {
      this.activatedRoute = activatedRoute;
      this.translate.addLangs(['en', 'fr', 'ur', 'es', 'it', 'fa', 'de']);
      this.translate.setDefaultLang('en');
      const browserLang = this.translate.getBrowserLang();
      this.translate.use(browserLang.match(/en|fr|ur|es|it|fa|de/) ? browserLang : 'en');

      // set course List ดึงข้อมูลจาก DB
      this.db.list(`users/${this.auth.currentUserId}/course/`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(items => {
        this.courseList = items;
        return items.map(item => item.key);
      });

      // Router
      this.router.events.subscribe(val => {
        if (
          val instanceof NavigationEnd &&
          window.innerWidth <= 992 &&
          this.isToggled()
        ) {
          this.toggleSidebar();
          //this.router.navigated = false;
        }
      });
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      let id = parseInt(params.get('id'));
      this.selectedId = id;
    } );
  }

  // Course Fn
  onSelect(course) {
    //this.router.navigate(['/departments', department.id]);
     this.router.navigate([course.id], { relativeTo: this.activatedRoute });
  }

  isSelected(course) { return course.id === this.selectedId; }

  //////////////////////////////////////////////////////////////////////////////////////
  eventCalled() {
    this.isActive = !this.isActive;
  }

  addExpandClass(element: any) {
    if (element === this.showMenu) {
      this.showMenu = '0';
    } else {
      this.showMenu = element;
    }
  }

  isToggled(): boolean {
    const dom: Element = document.querySelector('body');
    return dom.classList.contains(this.pushRightClass);
  }

  toggleSidebar() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle(this.pushRightClass);
  }

  rltAndLtr() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle('rtl');
  }

  changeLang(language: string) {
    this.translate.use(language);
  }

  onLoggedout() {
    localStorage.removeItem('isLoggedin');
  }

  setCourseId(id : number){
    this.toastr.success('เลือก'+id);
    this.courseService.setCourseId(id);
  }

  setCourseKey(key : string){
    //this.toastr.success('เลือก'+id);
    this.courseService.setCourseKey(key);
  }


}
