import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder} from '@angular/forms';

@Component({
  selector: 'app-qrcode',
  templateUrl: './qrcode.component.html',
  styleUrls: ['./qrcode.component.scss'],
  animations: [routerTransition()]
})
export class QrcodeComponent implements OnInit {
  qrcode = "https://chart.googleapis.com/chart?cht=qr&chl=Hello+World&chs=200x200&chld=L|0";
  uForm: FormGroup;
  content: string;

  constructor() { }

  ngOnInit() {
    this.uForm = new FormGroup({
      content: new FormControl('')
    });
  }

  gen(): void {
    this.qrcode = "https://chart.googleapis.com/chart?cht=qr&chl=" + this.uForm.value.content + "&chs=200x200&chld=L|0";
    console.log(this.qrcode)
  }
}
