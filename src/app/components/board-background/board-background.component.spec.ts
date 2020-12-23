import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BoardBackgroundComponent } from './board-background.component';

describe('BoardBackgroundComponent', () => {
  let component: BoardBackgroundComponent;
  let fixture: ComponentFixture<BoardBackgroundComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BoardBackgroundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
