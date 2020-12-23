import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PlayBackgroundComponent } from './play-background.component';

describe('PlayBackgroundComponent', () => {
  let component: PlayBackgroundComponent;
  let fixture: ComponentFixture<PlayBackgroundComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayBackgroundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
