import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EffectScoreComponent } from './effect-score.component';

describe('EffectScoreComponent', () => {
  let component: EffectScoreComponent;
  let fixture: ComponentFixture<EffectScoreComponent>;

  beforeEach(async(() => {
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
