import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LevelStatusComponent } from './level-status.component';

describe('LevelStatusComponent', () => {
  let component: LevelStatusComponent;
  let fixture: ComponentFixture<LevelStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LevelStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LevelStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
