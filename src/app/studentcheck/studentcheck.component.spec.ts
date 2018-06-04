import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentcheckComponent } from './studentcheck.component';

describe('StudentcheckComponent', () => {
  let component: StudentcheckComponent;
  let fixture: ComponentFixture<StudentcheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentcheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentcheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
