import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlcaldeComponent } from './alcalde.component';

describe('AlcaldeComponent', () => {
  let component: AlcaldeComponent;
  let fixture: ComponentFixture<AlcaldeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlcaldeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlcaldeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
