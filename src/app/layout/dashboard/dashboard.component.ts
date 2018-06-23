import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { AuthService } from "../../shared/services/auth.service";
import { Observable } from 'rxjs/Observable';
import { toArray } from 'rxjs/operator/toArray';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()]
})
export class DashboardComponent implements OnInit {
  courseList: any;
  groupList: any;
  studentList: any;
  scheduleAttendanceList: any;
  studentAttendanceList: any;
  data: any;

    public alerts: Array<any> = [];
    public sliders: Array<any> = [];

    // bar chart
    public barChartOptions: any = {
      scaleShowVerticalLines: false,
      responsive: true
  };
  public barChartLabels: string[] = [
      '2006',
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012'
  ];
  public barChartType: string = 'bar';
  public barChartLegend: boolean = true;

  public barChartData: any[] = [
      { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
      { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  ];

  // Doughnut
  public doughnutChartLabels: string[] = [
      'Download Sales',
      'In-Store Sales',
      'Mail-Order Sales'
  ];
  public doughnutChartData: number[] = [350, 450, 100];
  public doughnutChartType: string = 'doughnut';

  // Radar
  public radarChartLabels: string[] = [
      'Eating',
      'Drinking',
      'Sleeping',
      'Designing',
      'Coding',
      'Cycling',
      'Running'
  ];
  public radarChartData: any = [
      { data: [65, 59, 90, 81, 56, 55, 40], label: 'Series A' },
      { data: [28, 48, 40, 19, 96, 27, 100], label: 'Series B' }
  ];
  public radarChartType: string = 'radar';

  // Pie
  public pieChartLabels: string[] = [
      'Download Sales',
      'In-Store Sales',
      'Mail Sales'
  ];
  public pieChartData: number[] = [300, 500, 100];
  public pieChartType: string = 'pie';

  // PolarArea
  public polarAreaChartLabels: string[] = [
      'Download Sales',
      'In-Store Sales',
      'Mail Sales',
      'Telesales',
      'Corporate Sales'
  ];
  public polarAreaChartData: number[] = [300, 500, 100, 40, 120];
  public polarAreaLegend: boolean = true;

  public polarAreaChartType: string = 'polarArea';

  // lineChart
  public lineChartData: Array<any> = [
      { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
      { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' },
      { data: [18, 48, 77, 9, 100, 27, 40], label: 'Series C' }
  ];
  public lineChartLabels: Array<any> = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July'
  ];
  public lineChartOptions: any = {
      responsive: true
  };
  public lineChartColors: Array<any> = [
      {
          // grey
          backgroundColor: 'rgba(148,159,177,0.2)',
          borderColor: 'rgba(148,159,177,1)',
          pointBackgroundColor: 'rgba(148,159,177,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(148,159,177,0.8)'
      },
      {
          // dark grey
          backgroundColor: 'rgba(77,83,96,0.2)',
          borderColor: 'rgba(77,83,96,1)',
          pointBackgroundColor: 'rgba(77,83,96,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(77,83,96,1)'
      },
      {
          // grey
          backgroundColor: 'rgba(148,159,177,0.2)',
          borderColor: 'rgba(148,159,177,1)',
          pointBackgroundColor: 'rgba(148,159,177,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(148,159,177,0.8)'
      }
  ];
  public lineChartLegend: boolean = true;
  public lineChartType: string = 'line';

  // events
  public chartClicked(e: any): void {
      // console.log(e);
  }

  public chartHovered(e: any): void {
      // console.log(e);
  }

  public randomize(): void {
      // Only Change 3 values
      const data = [
          Math.round(Math.random() * 100),
          59,
          80,
          Math.random() * 100,
          56,
          Math.random() * 100,
          40
      ];
      const clone = JSON.parse(JSON.stringify(this.barChartData));
      clone[0].data = data;
      this.barChartData = clone;
      /**
       * (My guess), for Angular to recognize the change in the dataset
       * it has to change the dataset variable directly,
       * so one way around it, is to clone the data, change it and then
       * assign it;
       */
  }

  // Pie
  public pieAttendanceLabels: string[] = [
    'On Time',
    'Late',
    'Leave/Sick',
    'Missed Class'
  ];
  public pieAttendanceData: number[] = [300, 500, 100, 50];
  public pieAttendanceType: string = 'pie';

  constructor(
    private db: AngularFireDatabase,
    private auth: AuthService
  ) {
    this.groupList = [];
    let groupNo;
    let courseId;
    this.data = [];
    let attendance = [];
    //let k=0;
    // query
    this.db.list(`users/${this.auth.currentUserId}/course/`).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
    }).subscribe(itemsC => {
      this.courseList = itemsC;
      
      for(let i=0; i<this.courseList.length; i++){
        let temp = this.courseList[i].id;
        let x = this.courseList[i];
        let groupCount = Number(this.courseList[i].groupNo);

        this.db.list(`users/${this.auth.currentUserId}/course/${temp}/schedule/attendance`).snapshotChanges().map(actions => {
          return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(itemsSc => {
          this.scheduleAttendanceList = itemsSc;
          return itemsSc.map(item => item.key);
        });


        this.db.list(`users/${this.auth.currentUserId}/course/${temp}/students`).snapshotChanges().map(actions => {
          return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(items => {
          this.studentList = items;
          this.data[i] = [{course:x},{students:this.studentList}];

          ////////////////////////////////////////////////////
          let countLeave = 0,countLate = 0,countOnTime = 0,countMissed = 0,all = 0;
          //for(var a=1; a<=groupCount ;a++){
            let attId;
            for(var a=0; a<this.scheduleAttendanceList.length; a++){
              countLeave = 0,countLate = 0,countOnTime = 0,countMissed = 0,all = 0;
              attId = this.scheduleAttendanceList[a].id;
              
              for(var b=0; b<this.studentList.length ;b++){
                //if(this.studentList[b].group == temp){  
                  let tempStd = this.studentList[b].attendance[attId].status;
                  all++;
                  if(tempStd == 'Leave'){
                    countLeave++;
                  }else if(tempStd == 'Late'){
                    countLate++;
                  }else if(tempStd == 'onTime'){
                    countOnTime++;
                  }else if(tempStd == 'Missed Class'){
                    countMissed++;
                  }
                //}
              }
              attendance.push({attId,countOnTime,countLate,countLeave,countMissed});
              //console.log(temp,attId,countLeave,countLate,countOnTime,countMissed,all);
              //this.pieAttendanceData = [Number(countOnTime),Number(countLate),Number(countLeave),Number(countMissed)];
              //let pie = [{attId:attId},{pieAttendanceData:this.pieAttendanceData}]
            }
            //console.log(this.data[i][0].course.id);

            

            if(String(temp) == String(this.data[i][0].course.id)){
              this.data[i].push({attendance:attendance});
              attendance = [];
            }
          
          let xBar = 0;
          let sumOntime = 0, sumLate = 0, sumLeave = 0, sumMissed = 0;
          let total = this.data[i][2].attendance.length*this.data[i][1].students.length;
          //console.log(this.data[i][2]);
          
          for(var c=0; c<this.data[i][2].attendance.length; c++){
            sumOntime = sumOntime + this.data[i][2].attendance[c].countOnTime;
            sumLate = sumLate + this.data[i][2].attendance[c].countLate;
            sumLeave = sumLeave + this.data[i][2].attendance[c].countLeave;
            sumMissed = sumMissed + this.data[i][2].attendance[c].countMissed;
          }
          //xBar = sumOntime/total;
          let pieAttendanceData: number[] = [100*sumOntime/total, 100*sumLate/total, 100*sumLeave/total, 100*sumMissed/total];
          this.data[i].push({pie: pieAttendanceData});
          /*
          console.log('sumOntime',sumOntime);
          console.log('sumLate',sumLate);
          console.log('sumLeave',sumLeave);
          console.log('sumMissed',sumMissed);
          */
          

          
          console.log(this.data[i]);
          
          return items.map(item => item.key);
        });
      }
      
      return itemsC.map(item => item.key);
    });

    

    

    /*
    this.sliders.push(
      {
        imagePath: 'assets/images/slider1.jpg',
        label: 'First slide label',
        text: 'Nulla vitae elit libero, a pharetra augue mollis interdum.'
      },
      {
        imagePath: 'assets/images/slider2.jpg',
        label: 'Second slide label',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
      },
      {
        imagePath: 'assets/images/slider3.jpg',
        label: 'Third slide label',
        text: 'Praesent commodo cursus magna, vel scelerisque nisl consectetur.'
      }
      );

    this.alerts.push(
      {
        id: 1,
        type: 'success',
        message: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        oluptates est animi quibusdam praesentium quam, et perspiciatis,
        consectetur velit culpa molestias dignissimos
        voluptatum veritatis quod aliquam! Rerum placeat necessitatibus, vitae dolorum`
      },
      {
        id: 2,
        type: 'warning',
        message: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        Voluptates est animi quibusdam praesentium quam, et perspiciatis,
        consectetur velit culpa molestias dignissimos
        voluptatum veritatis quod aliquam! Rerum placeat necessitatibus, vitae dolorum`
      }
    );
    */
  }

  ngOnInit() {}

  public closeAlert(alert: any) {
    const index: number = this.alerts.indexOf(alert);
    this.alerts.splice(index, 1);
  }
}
