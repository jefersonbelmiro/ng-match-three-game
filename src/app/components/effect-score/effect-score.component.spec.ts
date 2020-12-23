import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EffectScoreComponent } from './effect-score.component';

describe('EffectScoreComponent', () => {
  let component: EffectScoreComponent;
  let fixture: ComponentFixture<EffectScoreComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EffectScoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EffectScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
