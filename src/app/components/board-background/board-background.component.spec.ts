import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardBackgroundComponent } from './board-background.component';

describe('BoardBackgroundComponent', () => {
  let component: BoardBackgroundComponent;
  let fixture: ComponentFixture<BoardBackgroundComponent>;

  beforeEach(async(() => {
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
