import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from "../shared/services/auth.service";
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-studentcheck',
  templateUrl: './studentcheck.component.html',
  styleUrls: ['./studentcheck.component.scss'],
  animations: [routerTransition()]
})
export class StudentcheckComponent implements OnInit {

  studentScoreForm: FormGroup;
  courseList: any;
  student : any;
  courseData : any;
  teachData : any;
  studentCourseData : any;
  showTableCourse;
  showTableStd;
  showTableData;
  showMissClass = {flag: false, name:"OFF"};
  showPercentageA= {flag: false, name:"OFF"};
  showPercentageQ= {flag: false, name:"OFF"};
  showPercentageH= {flag: false, name:"OFF"};
  showGroup= {flag: false, name:"OFF"};
  scoreCase = {high: 5, med:4, low:2};
  item : any;
  btn_attendance = [];
  btn_quiz = [];
  btn_hw = [];
  scheduleAttendanceList : any;
  scheduleAttendanceSortList
  scheduleQuizList : any;
  scheduleQuizSortList : any;
  scheduleHomeworkList : any;
  scheduleHomeworkSortList : any;
  studentListArr : any;
  percentFlag = false;
  totalStudentPercentA = [];
  totalStudentPercentQ = [];
  totalStudentPercentH = [];
  totalMissClass = [];
  percentAtt: number;
  percentQuiz: number;
  percentHw: number;

  constructor(
    private db: AngularFireDatabase,
    private auth: AuthService,
    private toastr: ToastrService
  ) { }

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
      this.studentIden();
      this.showTableData = true;
    }else if(this.studentScoreForm.value.sid != ''){
      this.studentIden();
      this.showTableStd = true;
    }else if(this.studentScoreForm.value.cid != ''){
      this.courseIden();
      this.showTableCourse = true;
    }else{
      this.toastr.success("กรุณาป้อนรหัสวิชา หรือรหัสนักศึกษา");
    }
  }

  studentIden(){
    this.courseData = [];
    let temp = [];
    this.teachData = [];
    let sid = this.studentScoreForm.value.sid;
    this.db.list(`users/`).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(items => {
      for(var i=0; i<items.length; i++){
        this.courseData[i] = Object.keys(items[i].course)
          .map(key => Object.assign({ key }, items[i].course[key]));
        this.teachData[i] = items[i];
      }
      for(var i=0; i<this.courseData.length; i++){
        for(var j=0; j<this.courseData[i].length; j++){
          if(this.courseData[i][j].students != undefined){
            temp[j] = Object.keys(this.courseData[i][j].students)
              .map(key => Object.assign({ key }, 
                this.courseData[i][j].students[key]
              ));
              temp[j].push({course:this.courseData[i][j]});
              temp[j].push({profile:this.teachData[i]});
          }
        }
      }

      this.student = [];
      let k =0;
      for(var i=0; i<temp.length; i++){
        for(var j=0; j<temp[i].length; j++){
          if(temp[i][j].id == sid){
            this.student[k] = 
              [
                {std:temp[i][j]},
                {course:temp[i][temp[i].length-2].course},
                {profile:temp[i][temp[i].length-1].profile.profile}
              ]
            k++;
          }

        }
      }
      //console.log(this.student);
      if(this.studentScoreForm.value.cid != ''){
        this.studentCourseData = [];
        for(var i=0; i<this.student.length; i++){
          if(this.student[i][1].course.id == this.studentScoreForm.value.cid){
            this.studentCourseData = this.student[i];
            this.item = this.student[i][1].course;
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
      for(var i=0; i< items.length; i++){
        if(items[i].course[cid]){
          this.courseList[i] = [{profile: items[i].profile},{course : items[i].course[cid]}];
        }
      }
    });
    return this.courseList;
  }

  something(course){
    this.item = course;
    this.std();
    this.findScore();
    console.log(this.item);
    this.showTableData = true;
    
  }

  std(){
    this.studentListArr = [];
    var len = Object.keys(this.item.students).length;
      for(var i=0; i<len;i++){
        this.studentListArr = Object.keys(this.item.students)
        .map(key => Object.assign({ key }, this.item.students[key]));
    }
    console.log("Here Student");
    console.log(this.studentListArr)
  }
  
  findScore(){
    this.percentAtt = this.item.percentAtt;
    this.percentQuiz = this.item.percentQuiz;
    this.percentHw = this.item.percentHw;

    this.scheduleAttendanceList = [];
    if(this.item.schedule.attendance != undefined){
      var len = Object.keys(this.item.schedule.attendance).length;
      for(var i=0; i<len;i++){
        this.scheduleAttendanceList = Object.keys(this.item.schedule.attendance)
        .map(key => Object.assign({ key }, this.item.schedule.attendance[i]));
      }
      this.btn_attendance =[];
      for(var i=0 ; i<this.scheduleAttendanceList.length ;i++){
        if(i%5==0)
          this.btn_attendance.push({id:i+5,name: (i+1)+'-'+(i+5)});
      }
      let sdtLen =  this.scheduleAttendanceList.length;
      console.log(this.scheduleAttendanceList)
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
    }else{
      
    }
    console.log(this.scheduleAttendanceSortList);

    // 2. Query Quiz
    this.scheduleQuizList = [];
    if(this.item.schedule.quiz != undefined){
      var len = Object.keys(this.item.schedule.quiz).length;
      for(var i=0; i<len;i++){
        this.scheduleQuizList = Object.keys(this.item.schedule.quiz)
        .map(key => Object.assign({ key }, this.item.schedule.quiz[i]));
      }
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
    }else{
      
    }


    // 3. Query Homwork
    this.scheduleHomeworkList = [];
    if(this.item.schedule.hw != undefined){
      var len = Object.keys(this.item.schedule.hw).length;
      for(var i=0; i<len;i++){
        this.scheduleHomeworkList = Object.keys(this.item.schedule.hw)
        .map(key => Object.assign({ key }, this.item.schedule.hw[i]));
      }
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
    }else{
      
    }
    console.log(this.scheduleAttendanceSortList);

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

  findPercentageA(percent : Number){
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
        this.totalStudentPercentA.push(Number(temp)*Number(percent)/Number(fullScore));
        this.studentListArr = Object.keys(this.studentListArr)
        .map(key => Object.assign({ key }, this.studentListArr[key], {percent:this.totalStudentPercentA[key]}));

      }
    }
  }

  findPercentageQ(percent : Number){
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
        this.totalStudentPercentQ.push(Number(temp)*Number(percent)/Number(fullScore));
        this.studentListArr = Object.keys(this.studentListArr)
        .map(key => Object.assign({ key }, this.studentListArr[key], {percent:this.totalStudentPercentQ[key]}));

      }
    }
  }

  findPercentageH(percent : Number){
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
        this.totalStudentPercentH.push(Number(temp)*Number(percent)/Number(fullScore));
        this.studentListArr = Object.keys(this.studentListArr)
        .map(key => Object.assign({ key }, this.studentListArr[key], {percent:this.totalStudentPercentH[key]}));

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

  

  onSwitchShowPercentA(percent){
    console.log(this.percentAtt)
    if(percent != undefined){
      this.showPercentageA.flag= !this.showPercentageA.flag;
      if(this.showPercentageA.flag){
        this.showPercentageA.name = "ON";
        this.totalStudentPercentA = [];
        this.showPercentageQ.flag = false;
        this.showPercentageH.flag = false;
        this.findPercentageA(percent);
      }else{
        this.showPercentageA.name = "OFF";
        this.totalStudentPercentA = [];
      }
    }else{
      this.toastr.warning("กรุณาตั้งค่า % การเข้าเรียน");
    }
  }

  onSwitchShowPercentQ(percent){
    if(percent != undefined){
      this.showPercentageQ.flag= !this.showPercentageQ.flag;
      if(this.showPercentageQ.flag){
        this.showPercentageQ.name = "ON";
        this.totalStudentPercentQ = [];
        this.showPercentageA.flag = false;
        this.showPercentageH.flag = false;
        this.findPercentageQ(percent);
      }else{
        this.showPercentageQ.name = "OFF";
        this.totalStudentPercentQ = [];
      }
    }else{
      this.toastr.warning("กรุณาตั้งค่า % ควิซ");
    }
  }

  onSwitchShowPercentH(percent){
    if(percent != undefined){
      this.showPercentageH.flag= !this.showPercentageH.flag;
      if(this.showPercentageH.flag){
        this.showPercentageH.name = "ON";
        this.totalStudentPercentH = [];
        this.showPercentageA.flag = false;
        this.showPercentageQ.flag = false;
        this.findPercentageH(percent);
      }else{
        this.showPercentageH.name = "OFF";
        this.totalStudentPercentH = [];
      }
    }else{
      this.toastr.warning("กรุณาตั้งค่า % การบ้าน");
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
