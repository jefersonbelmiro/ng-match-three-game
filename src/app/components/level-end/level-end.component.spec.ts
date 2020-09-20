import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelEndComponent } from './level-end.component';

describe('LevelEndComponent', () => {
  let component: LevelEndComponent;
  let fixture: ComponentFixture<LevelEndComponent>;

  beforeEach(async(() => {
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
