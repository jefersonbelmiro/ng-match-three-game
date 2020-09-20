import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelIntroComponent } from './level-intro.component';

describe('LevelIntroComponent', () => {
  let component: LevelIntroComponent;
  let fixture: ComponentFixture<LevelIntroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LevelIntroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LevelIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
