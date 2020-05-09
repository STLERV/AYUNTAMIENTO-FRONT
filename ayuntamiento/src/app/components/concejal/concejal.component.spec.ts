import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConcejalComponent } from './concejal.component';

describe('ConcejalComponent', () => {
  let component: ConcejalComponent;
  let fixture: ComponentFixture<ConcejalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConcejalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConcejalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
