import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LevelEndComponent } from './level-end.component';

describe('LevelEndComponent', () => {
  let component: LevelEndComponent;
  let fixture: ComponentFixture<LevelEndComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LevelEndComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LevelEndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
