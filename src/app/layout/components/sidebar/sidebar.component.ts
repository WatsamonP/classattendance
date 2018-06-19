import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
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
import { NgbModal, ModalDismissReasons, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from '../../../shared/services/messageService';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent {

  @Output() onFilter: EventEmitter<any> = new EventEmitter();

  isActive: boolean = false;
  showMenu: string = '';
  showSubMenu: string = '';
  showInsertStudent: string = '';
  showEditCourse: string = '';
  pushRightClass: string = 'push-right';

  private paramMapSubscription: Subscription;
  // Course Var
  public selectedId;
  courseList: Course[];
  courseListArr : any;
  courseGroup : any;
  groupList : any;
  groupShow : boolean;
  closeResult: string;

  constructor(
    private translate: TranslateService,
    public router: Router,
    private courseService: CourseService,
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private toastr: ToastrService,
    private db: AngularFireDatabase,
    private modalService: NgbModalModule,
    private _messageService: MessageService) {
      this.activatedRoute = activatedRoute;
      this.translate.addLangs(['en', 'fr', 'ur', 'es', 'it', 'fa', 'de']);
      this.translate.setDefaultLang('en');
      const browserLang = this.translate.getBrowserLang();
      this.translate.use(browserLang.match(/en|fr|ur|es|it|fa|de/) ? browserLang : 'en');
      this.groupShow = false;

      // set course List ดึงข้อมูลจาก DB
      this.db.list(`users/${this.auth.currentUserId}/course/`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(items => {
        this.courseList = items;
        this.groupList = [];
 
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

  clickFilter():void {
    // this.onFilter.emit('Register click');
    //this._messageService.filter('Register click');
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

  addExpandClass(element: any){
    if(element === this.showMenu){
      this.showMenu = '0';
      this.groupList = [];
    }else{
      this.showMenu = element;
      this.groupList = [];
    }
  }

  expandInsertStudent(element: any){
    if(element === this.showInsertStudent){
      this.showInsertStudent = '0';
      this.groupList = [];
    }else{
      this.showInsertStudent = element;
      this.groupList = [];
    }
  }

  expandEditCourse(element: any){
    if(element === this.showEditCourse){
      this.showEditCourse = '0';
      this.groupList = [];
    }else{
      this.showEditCourse = element;
      this.groupList = [];
    }
  }

  addExpandClassGroup(element: any){
    if(element === this.showSubMenu){
      console.log(2);
      this.showSubMenu = '0';
      this.groupList = [];
    }else {
      console.log(3);
      this.showSubMenu = element;
      for(var i=0; i<this.courseList.length; i++){
        if(this.courseList[i].id == element.toString()){
          this.groupList = Object.keys(this.courseList[i].group)
            .map(key => Object.assign({ key }, this.courseList[i].group[key]));
        }
      }
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
    this.auth.signOut();
  }

  setCourseId(id : number){
    this.toastr.success('เลือก'+id);
    this.courseService.setCourseId(id);
  }

  setCourseKey(key : string, group :string){

    //this.toastr.success('เลือก'+id);
    this.courseService.setCourseKey(key, group);
  }

  ///เพิ่มเติมม
  click_Std_Keybaord(id: string) {
    this._messageService.filter({todo:'std_keyboard'});
  }
  click_Std_csv(id: string) {
    this._messageService.filter({todo:'std_csv'});
  }
  click_Edit(id: string) {
    this._messageService.filter({todo:'edit',fn: id});
  }
  click_Delete(id: string) {
    this._messageService.filter({todo:'delete',fn:id});
  }
  click_Export(id: string) {
    this._messageService.filter({todo:'export',fn:id});
  }
  ///////////////////////////////////////////////////////////
  exportToExcel(id: string){

  }



}
