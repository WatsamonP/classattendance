import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class ExcelService {

  constructor() { }

  public exportAsExcelFile(json: any[], json2: any[], json3: any[], json4:any[], cid: string, gid: string, cname: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const worksheet2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json2);
    const worksheet3: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json3);
    const worksheet4: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json4);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    XLSX.utils.book_append_sheet(workbook, worksheet2, 'Quiz');
    XLSX.utils.book_append_sheet(workbook, worksheet3, 'Homework');
    XLSX.utils.book_append_sheet(workbook, worksheet4, 'Lab');
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, cid, gid, cname);
  }

  private saveAsExcelFile(buffer: any, cid: string, gid: string, cname: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    //export_523211-DatabaseSystems-Group1_[19/06/2018
    FileSaver.saveAs(data, 'export_' + cid + '-' + cname + '-Group' + gid + '_[' + new Date().getDate() + '-' + (new Date().getMonth()+1) + '-'+new Date().getFullYear()+']' + EXCEL_EXTENSION);
  }

}
