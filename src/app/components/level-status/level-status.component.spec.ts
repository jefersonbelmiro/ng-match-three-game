import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelStatusComponent } from './level-status.component';

describe('LevelStatusComponent', () => {
  let component: LevelStatusComponent;
  let fixture: ComponentFixture<LevelStatusComponent>;

  beforeEach(async(() => {
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
