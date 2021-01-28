import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplayerStatusComponent } from './multiplayer-status.component';

describe('MultiplayerStatusComponent', () => {
  let component: MultiplayerStatusComponent;
  let fixture: ComponentFixture<MultiplayerStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiplayerStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiplayerStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
