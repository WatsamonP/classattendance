import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from "../shared/services/auth.service";
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { ToastrService } from 'ngx-toastr';
import { Student } from '../shared/services/student/student.model';

@Component({
  selector: 'app-studentcheck',
  templateUrl: './studentcheck.component.html',
  styleUrls: ['./studentcheck.component.scss'],
  animations: [routerTransition()]
})
export class StudentcheckComponent implements OnInit {

  studentScoreForm: FormGroup;
  studentList: Student[];
  courseList: any;
  student : any;
  courseData : any;
  csData : any;
  studentCourseData : any;
  showTableCourse;
  showTableStd;
  showTableData;
  showMissClass = {flag: false, name:"OFF"};
  showPercentageA= {flag: false, name:"OFF"};
  showPercentageQ= {flag: false, name:"OFF"};
  showPercentageH= {flag: false, name:"OFF"};
  showPercentageL= {flag: false, name:"OFF"};
  showGroup= {flag: false, name:"OFF"};
  scoreCase = {high: 5, med:4, low:2};
  item : any;
  btn_attendance = [];
  btn_quiz = [];
  btn_hw = [];
  btn_lab = [];
  scheduleAttendanceList : any;
  scheduleAttendanceSortList: any;
  scheduleQuizList : any;
  scheduleQuizSortList : any;
  scheduleHomeworkList : any;
  scheduleHomeworkSortList : any;
  scheduleLabList : any;
  scheduleLabSortList : any;
  studentListArr : any;
  percentFlag = false;
  totalStudentPercentA = [];
  totalStudentPercentQ = [];
  totalStudentPercentH = [];
  totalStudentPercentL = [];
  totalMissClass = [];
  percentAtt: number;
  percentQuiz: number;
  percentHw: number;
  percentLab: number;
  detail: any;
  isExpandOption: boolean = false;

  constructor(
    private db: AngularFireDatabase,
    private auth: AuthService,
    private toastr: ToastrService
  ) { }

  switchExpandOption(){
    this.isExpandOption = !this.isExpandOption;
  }

  ngOnInit() {
    this.buildForm();
    this.showTableCourse = false;
    this.showTableStd = false;
    this.showTableData = false
  }

  onClick(){
    this.showTableCourse = false;
    this.showTableStd = false;
    this.showTableData = false;
    if(this.studentScoreForm.value.sid != '' && this.studentScoreForm.value.cid != ''){
      this.scIden();
    }else if(this.studentScoreForm.value.sid != ''){
      this.studentIden();
      this.showTableStd = true;
    }else if(this.studentScoreForm.value.cid != ''){
      this.courseIden();
      this.showTableCourse = true;
    }else{
      this.toastr.warning("กรุณาป้อนรหัสวิชา หรือรหัสนักศึกษา");
    }
  }
  scIden(){
    let sid = this.studentScoreForm.value.sid;
    let cid = this.studentScoreForm.value.cid;
    var c=0;
    this.courseData = [];
    this.db.list(`users/`).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(items => {
      var k=0;
      for(var i=0; i<items.length; i++){
        this.courseData[i] = Object.keys(items[i].course)
          .map(key => Object.assign({ key }, items[i].course[key]));
      }
      for(var i=0; i< items.length; i++){
        for(var j=0; j< this.courseData[i].length; j++){
          if(this.courseData[i][j].students[sid] && items[i].course[cid]){
            c++;
            this.findScore(items[i].key,cid);
            this.showTableData = true;
          }
        }
      }
    });
    if(c==0)
      this.toastr.warning("ไม่มีวิชานี้ หรือ นักศึกษาไม่ได้ลงเรียนวิชานี้");
  }
  studentIden(){
    this.courseData = [];
    this.student = [];
    let sid = this.studentScoreForm.value.sid;
    this.db.list(`users/`).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(items => {
      var j=0;
      var k=0;
      for(var i=0; i<items.length; i++){
        this.courseData[i] = Object.keys(items[i].course)
          .map(key => Object.assign({ key }, items[i].course[key]));
      }
      for(var i=0; i< items.length; i++){
        for(var j=0; j< this.courseData[i].length; j++){
          if(this.courseData[i][j].students[sid]){
            this.student[k] = [{course:this.courseData[i][j]},{profile:items[i].profile},{id:items[i].key}]
            k++;
          }
        }
      }
    });
    return this.student;
  }
  courseIden(){
    let temp = [];
    let cid = this.studentScoreForm.value.cid;
    this.courseList = [];
    this.db.list(`users/`).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(items => {
      var j=0;
      for(var i=0; i< items.length; i++){
        if(items[i].course[cid]){
          this.courseList[j] = [{profile: items[i].profile},{course : items[i].course[cid]},{id:items[i].key}];
          j++;
        }
      }
    });
    return this.courseList;
  }

  something(courseid,id){
    this.item = courseid;
    this.findScore(id,courseid);
    this.showTableData = true;
  }

  findScore(id,cid){
    this.showPercentageA= {flag: false, name:"OFF"};
    this.showPercentageQ= {flag: false, name:"OFF"};
    this.showPercentageH= {flag: false, name:"OFF"};
    this.showPercentageL= {flag: false, name:"OFF"};
    this.db.list(`users/${id}/course/`).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(items => {
        for(var i=0; i<items.length; i++){
          if(items[i].key == cid){
            this.percentAtt = items[i].percentAtt;
            this.percentQuiz = items[i].percentQuiz;
            this.percentHw = items[i].percentHw;
            this.percentLab = items[i].percentLab;
            this.detail = [{id: items[i].id},{name : items[i].name}];

          }
        }
    });
    this.db.list(`users/${id}/course/${cid}/students`).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(items => {
      this.studentList = items;

      let temp = [];
      for(var i=0; i<this.studentList.length ;i++){
        //console.log(this.studentList[i].group + ' HH' + this.groupId);
          temp.push(this.studentList[i]);
          continue;
      }
      this.studentListArr = Object.keys(temp)
        .map(key => Object.assign({ key }, temp[key]));
        return items.map(item => item.key);
    });

    this.db.list(`users/${id}/course/${cid}/schedule/attendance`).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(items => {
        this.scheduleAttendanceList = items;
        this.btn_attendance =[];
        for(var i=0 ; i<this.scheduleAttendanceList.length ;i++){
            if(i%5==0)
              this.btn_attendance.push({id:i+5,name: (i+1)+'-'+(i+5)});
        }
        let sdtLen =  this.scheduleAttendanceList.length;
        this.scheduleAttendanceSortList = [];
        var i=0;
        var count=0;
        for (sdtLen; sdtLen > i; i++) {
          count++;
          this.scheduleAttendanceSortList[i] = [{data: this.scheduleAttendanceList[i]},{index : i+1}];
          if(count==5){
            break;
          }
        };
        return items.map(item => item.key);
    });
    console.log(this.scheduleAttendanceSortList);

    // 2. Query Quiz
    this.db.list(`users/${id}/course/${cid}/schedule/quiz`).snapshotChanges().map(actions => {
    return actions.map(action => ({ key: action.key, ...action.payload.val() }));
    }).subscribe(items => {
      this.scheduleQuizList = items;
      this.btn_quiz =[];
      for(var i=0 ; i<this.scheduleQuizList.length ;i++){
          if(i%5==0)
            this.btn_quiz.push({id:i+5,name: (i+1)+'-'+(i+5)});
      }

      let sdtLen =  this.scheduleQuizList.length;
      this.scheduleQuizSortList = [];
      var i=0;
      var count=0;
      for (sdtLen; sdtLen > i; i++) {
        count++;
        this.scheduleQuizSortList[i] = [{data: this.scheduleQuizList[i]},{index : i+1}];
        if(count==5){
          break;
        }
      };
        return items.map(item => item.key);
    });

    // 3. Query Homwork
    this.db.list(`users/${id}/course/${cid}/schedule/hw`).snapshotChanges().map(actions => {
    return actions.map(action => ({ key: action.key, ...action.payload.val() }));
    }).subscribe(items => {
      this.scheduleHomeworkList = items;
      this.btn_hw =[];
      for(var i=0 ; i<this.scheduleHomeworkList.length ;i++){
          if(i%5==0)
            this.btn_hw.push({id:i+5,name: (i+1)+'-'+(i+5)});
      }

      let sdtLen =  this.scheduleHomeworkList.length;
      this.scheduleHomeworkSortList = [];
      var i=0;
      var count=0;
      for (sdtLen; sdtLen > i; i++) {
        count++;
        this.scheduleHomeworkSortList[i] = [{data: this.scheduleHomeworkList[i]},{index : i+1}];
        if(count==5){
          break;
        }
      };
        return items.map(item => item.key);
    });
    // 3. Query Lab
    this.db.list(`users/${id}/course/${cid}/schedule/lab`).snapshotChanges().map(actions => {
    return actions.map(action => ({ key: action.key, ...action.payload.val() }));
    }).subscribe(items => {
      this.scheduleLabList = items;
      this.btn_lab =[];
      for(var i=0 ; i<this.scheduleLabList.length ;i++){
          if(i%5==0)
            this.btn_lab.push({id:i+5,name: (i+1)+'-'+(i+5)});
      }

      let sdtLen =  this.scheduleLabList.length;
      this.scheduleLabSortList = [];
      var i=0;
      var count=0;
      for (sdtLen; sdtLen > i; i++) {
        count++;
        this.scheduleLabSortList[i] = [{data: this.scheduleLabList[i]},{index : i+1}];
        if(count==5){
          break;
        }
      };
        return items.map(item => item.key);
    });

  }

  onClickCourseCourse(something){
    let temp;
    this.student = [];
    let sid = this.studentScoreForm.value.sid;
    temp = Object.keys(something.students)
      .map(key => Object.assign({ key }, something.students[key]));
    for(var i=0; i<temp.length; i++){
      if(temp[i].id == sid){
        this.student[i] = [{attendance:temp[i].attendance},{quiz:temp[i].quiz}],{hw:temp[i].hw};
      }else{
        console.log('ไม่พบ Attendance/Quiz/Hw')
      }
    }
    console.log(this.student);
  }

  buildForm(): void {
    this.studentScoreForm = new FormGroup({
      cid: new FormControl('', [
        Validators.required,
        Validators.pattern("^[1-9]\\d{5}$")
       ]),
      sid: new FormControl('', [
        Validators.required,
        Validators.pattern("^[B|M|D]\\d{7}$")
      ]),
    });
  }


  ////////////////////////////////////////
  radioCheckA(id){
    let sdtLen =  this.scheduleAttendanceList.length;
    this.scheduleAttendanceSortList = [];
    console.log(id-5);
    var i= id-5;
    var j=0;
    for (id ; id > i; i++) {
      if(this.scheduleAttendanceList[i] != undefined){
        this.scheduleAttendanceSortList[j] = [{data: this.scheduleAttendanceList[i]},{index : i+1}];
        j++;
      }
    };
    console.log(this.scheduleAttendanceSortList);
  }
  radioCheckQ(id){
    let sdtLen =  this.scheduleQuizList.length;
    this.scheduleQuizSortList = [];
    console.log(id-5);
    var i= id-5;
    var j=0;
    for (id ; id > i; i++) {
      if(this.scheduleQuizList[i] != undefined){
        this.scheduleQuizSortList[j] = [{data: this.scheduleQuizList[i]},{index : i+1}];
        j++;
      }
    };
    console.log(this.scheduleQuizSortList);
  }
  radioCheckH(id){
    let sdtLen =  this.scheduleHomeworkList.length;
    this.scheduleHomeworkSortList = [];
    console.log(id-5);
    var i= id-5;
    var j=0;
    for (id ; id > i; i++) {
      if(this.scheduleHomeworkList[i] != undefined){
        this.scheduleHomeworkSortList[j] = [{data: this.scheduleHomeworkList[i]},{index : i+1}];
        j++;
      }
    };
    console.log(this.scheduleHomeworkSortList);
  }
  radioCheckL(id){
    let sdtLen =  this.scheduleLabList.length;
    this.scheduleLabSortList = [];
    console.log(id-5);
    var i= id-5;
    var j=0;
    for (id ; id > i; i++) {
      if(this.scheduleLabList[i] != undefined){
        this.scheduleLabSortList[j] = [{data: this.scheduleLabList[i]},{index : i+1}];
        j++;
      }
    };
    console.log(this.scheduleLabSortList);
  }

  findPercentageA(){
    let schedule,score,temp,temp2,fullScore;
    if(this.scheduleAttendanceList.length==0){
      console.log('ZERO')
    }else{

      for(var i=0; i<this.studentListArr.length ; i++){
        temp = 0;
        fullScore = 0;
        for(var j=0; j<this.scheduleAttendanceList.length ; j++){
          schedule = this.scheduleAttendanceList[j].key;
          score = this.studentListArr[i].attendance[schedule].score;
          fullScore = fullScore + Number(this.scheduleAttendanceList[j].onTimeScore);
          temp = temp + score;
        }
        this.totalStudentPercentA.push(Number(temp)*Number(this.percentAtt)/Number(fullScore));
        this.studentListArr = Object.keys(this.studentListArr)
        .map(key => Object.assign({ key }, this.studentListArr[key], {percent:this.totalStudentPercentA[key]}));

      }
    }
  }

  findPercentageQ(){
    let schedule,score,temp,temp2,fullScore;
    if(this.scheduleQuizList.length==0){
      console.log('ZERO')
    }else{

      for(var i=0; i<this.studentListArr.length ; i++){
        temp = 0;
        fullScore = 0;
        for(var j=0; j<this.scheduleQuizList.length ; j++){
          schedule = this.scheduleQuizList[j].key;
          score = this.studentListArr[i].quiz[schedule].score;
          fullScore = fullScore + Number(this.scheduleQuizList[j].totalScore);
          temp = temp + score;
        }
        this.totalStudentPercentQ.push(Number(temp)*Number(this.percentQuiz)/Number(fullScore));
        this.studentListArr = Object.keys(this.studentListArr)
        .map(key => Object.assign({ key }, this.studentListArr[key], {percent:this.totalStudentPercentQ[key]}));

      }
    }
  }

  findPercentageH(){
    let schedule,score,temp,temp2,fullScore;
    if(this.scheduleAttendanceList.length==0){
      console.log('ZERO')
    }else{

      for(var i=0; i<this.studentListArr.length ; i++){
        temp = 0;
        fullScore = 0;
        for(var j=0; j<this.scheduleHomeworkList.length ; j++){
          schedule = this.scheduleHomeworkList[j].key;
          score = this.studentListArr[i].hw[schedule].score;
          fullScore = fullScore + Number(this.scheduleHomeworkList[j].totalScore);
          temp = temp + score;
        }
        this.totalStudentPercentH.push(Number(temp)*Number(this.percentHw)/Number(fullScore));
        this.studentListArr = Object.keys(this.studentListArr)
        .map(key => Object.assign({ key }, this.studentListArr[key], {percent:this.totalStudentPercentH[key]}));

      }
    }
  }
  findPercentageL(){
    let schedule,score,temp,temp2,fullScore;
    if(this.scheduleLabList.length==0){
      console.log('ZERO')
    }else{

      for(var i=0; i<this.studentListArr.length ; i++){
        temp = 0;
        fullScore = 0;
        for(var j=0; j<this.scheduleLabList.length ; j++){
          schedule = this.scheduleLabList[j].key;
          score = this.studentListArr[i].lab[schedule].score;
          fullScore = fullScore + Number(this.scheduleLabList[j].totalScore);
          temp = temp + score;
        }
        this.totalStudentPercentL.push(Number(temp)*Number(this.percentLab)/Number(fullScore));
        this.studentListArr = Object.keys(this.studentListArr)
        .map(key => Object.assign({ key }, this.studentListArr[key], {percent:this.totalStudentPercentL[key]}));

      }
    }
  }

  findMissClassNumber(){
    let schedule,score,temp,temp2;
    if(this.scheduleAttendanceList.length==0){
      console.log('ZERO')
    }else{
      for(var i=0; i<this.studentListArr.length ; i++){
        temp = 0;
        for(var j=0; j<this.scheduleAttendanceList.length ; j++){
          schedule = this.scheduleAttendanceList[j].key;
          if(this.studentListArr[i].attendance[schedule].status == 'Missed Class'){
            temp = temp + 1;
          }
        }
        this.totalMissClass.push(temp);
        this.studentListArr = Object.keys(this.studentListArr)
        .map(key => Object.assign({ key }, this.studentListArr[key], {totalMiss:this.totalMissClass[key]}));
      }
    }
    console.log(this.studentListArr);
  }



  onSwitchShowPercentA(){
    if(this.percentAtt != undefined){
      this.showPercentageA.flag= !this.showPercentageA.flag;
      if(this.showPercentageA.flag){
        this.showPercentageA.name = "ON";
        this.totalStudentPercentA = [];
        this.showPercentageQ.flag = false;
        this.showPercentageQ.name = "OFF";
        this.showPercentageH.flag = false;
        this.showPercentageH.name = "OFF";
        this.showPercentageL.flag = false;
        this.showPercentageL.name = "OFF";
        this.findPercentageA();
      }else{
        this.showPercentageA.name = "OFF";
        this.totalStudentPercentA = [];
      }
    }
  }

  onSwitchShowPercentQ(){
    if(this.percentQuiz != undefined){
      this.showPercentageQ.flag= !this.showPercentageQ.flag;
      if(this.showPercentageQ.flag){
        this.showPercentageQ.name = "ON";
        this.totalStudentPercentQ = [];
        this.showPercentageA.flag = false;
        this.showPercentageA.name = "OFF";
        this.showPercentageH.flag = false;
        this.showPercentageH.name = "OFF";
        this.showPercentageL.flag = false;
        this.showPercentageL.name = "OFF";
        this.findPercentageQ();
      }else{
        this.showPercentageQ.name = "OFF";
        this.totalStudentPercentQ = [];
      }
    }
  }

  onSwitchShowPercentH(){
    if(this.percentHw != undefined){
      this.showPercentageH.flag= !this.showPercentageH.flag;
      if(this.showPercentageH.flag){
        this.showPercentageH.name = "ON";
        this.totalStudentPercentH = [];
        this.showPercentageA.flag = false;
        this.showPercentageA.name = "OFF";
        this.showPercentageQ.flag = false;
        this.showPercentageQ.name = "OFF";
        this.showPercentageL.flag = false;
        this.showPercentageL.name = "OFF";
        this.findPercentageH();
      }else{
        this.showPercentageH.name = "OFF";
        this.totalStudentPercentH = [];
      }
    }
  }

    onSwitchShowPercentL(){
      if(this.percentLab != undefined){
        this.showPercentageL.flag= !this.showPercentageL.flag;
        if(this.showPercentageL.flag){
          this.showPercentageL.name = "ON";
          this.totalStudentPercentH = [];
          this.showPercentageA.flag = false;
          this.showPercentageA.name = "OFF";
          this.showPercentageQ.flag = false;
          this.showPercentageQ.name = "OFF";
          this.showPercentageH.flag = false;
          this.showPercentageH.name = "OFF";
          this.findPercentageL();
        }else{
          this.showPercentageL.name = "OFF";
          this.totalStudentPercentL = [];
        }
      }
    }

  onSwitchShowMissClass(){
    this.showMissClass.flag= !this.showMissClass.flag;
    if(this.showMissClass.flag){
      this.showMissClass.name = "ON";
      this.totalMissClass = [];
      this.findMissClassNumber();
    }else{
      this.showMissClass.name = "OFF";
      this.totalMissClass = [];
    }
  }
  onSwitchShowGroup(){
    this.showGroup.flag= !this.showGroup.flag;
    if(this.showGroup.flag){
      this.showGroup.name = "ON";
    }else{
      this.showGroup.name = "OFF";
    }
  }
  ///////////////////////////////////////////////////////////


}
