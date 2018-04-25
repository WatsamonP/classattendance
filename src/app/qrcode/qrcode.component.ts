import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-qrcode',
  templateUrl: './qrcode.component.html',
  styleUrls: ['./qrcode.component.scss'],
  animations: [routerTransition()]
})

export class QrcodeComponent implements OnInit {
  qrcode = "https://chart.googleapis.com/chart?cht=qr&chl=Hello+World&chs=180x180&chld=L|0";
  uForm: FormGroup;
  content: string;

  docDefinition = {
    content: [],
    defaultStyle: { alignment: 'justify' },
    pageSize: 'A4',
    anotherStyle: { italics: true, alignment: 'centered'}
  }

  constructor(private toastr: ToastrService) { }

  ngOnInit() {
    this.uForm = new FormGroup({
      content: new FormControl('', [
        //Validators.pattern('^(?=.*[0–9])$'),
        //Validators.maxLength(25)
      ])
    });
  }

  onDownload(){
    if(this.uForm.value.content  == null || this.uForm.value.content  == ""){
      this.toastr.warning("กรุณาป้อนรหัสนักศึกษา");
    }else{
      this.qrcode = "https://chart.googleapis.com/chart?cht=qr&chl=" + this.uForm.value.content + "&chs=180x180&chld=L|0";
      console.log(this.qrcode);
      this.docDefinition.content = [
        {
          style: 'tableExample',
          color: 'black',   // font color
          table: {
            heights: [ 'auto', 'auto', 'auto', 'auto','auto', 650],
            widths: [ '60%','20%', '20%' ],
            body: [
              [ {border: [true, true, true, false],text: '' },
                {border: [true, true, true, true],rowSpan: 5,text: 'POINT', bold: true, alignment:'center' } ,
                {border: [true, true, true, false],rowSpan: 4,qr:this.uForm.value.content ,fit: 85 , alignment:'center'}],
              [ {border: [true, false, true, false],text: 'Subjects : ______________________________' }, '',''],
              [ {border: [true, false, true, false],text: 'Date : _____ /_____________ /_________' }, '' , ''],
              [ {border: [true, false, true, true],rowSpan: 2,text: 'Name : ____________________________________' },'',],
              [ '','',{border: [true, false, true, true],text:this.uForm.value.content , alignment:'center'}],
              [ {border: [true, true, true, true],colSpan: 3,text: ' ' }]
            ]
          },
          layout: {
            defaultBorder: false,
          }
        }
      ]
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
      pdfMake.createPdf(this.docDefinition).download('QR_'+this.uForm.value.content+'.pdf');
      //pdfMake.createPdf(this.docDefinition).download();
      this.toastr.success("ดาวน์โหลด "+'QR_'+this.uForm.value.content+'.pdf');
    }
  }
}
